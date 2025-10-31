import vision from '@google-cloud/vision';
import path from 'path';
import fs from 'fs';

// Initialize the Vision API client
// Note: For production, set GOOGLE_APPLICATION_CREDENTIALS environment variable
// For development/demo, credentials aren't set
let visionClient: vision.ImageAnnotatorClient | null = null;

try {
	// Check if GOOGLE_APPLICATION_CREDENTIALS is set and valid
	const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
	
	if (credsPath && !credsPath.includes('/path/to/')) {
		// Check if file exists
		if (fs.existsSync(credsPath)) {
			visionClient = new vision.ImageAnnotatorClient();
			console.log('✓ Google Cloud Vision API initialized');
		} else {
			console.warn('⚠️  Google Cloud Vision credentials file not found:', credsPath);
			console.warn('   Image analysis will be skipped.');
		}
	} else {
		console.warn('⚠️  Google Cloud Vision API not configured. Image analysis will be skipped.');
		console.warn('   To enable: Set GOOGLE_APPLICATION_CREDENTIALS to your service account key path');
	}
} catch (error) {
	console.warn('⚠️  Failed to initialize Google Cloud Vision API. Image analysis will be skipped.');
	console.warn('   Error:', error);
}

export interface VisionAnalysisResult {
	labels: Array<{ name: string; confidence: number }>;
	objects: Array<{ name: string; confidence: number }>;
	detectedText?: string;
	suggestedDescription?: string;
}

/**
 * Analyze an image using Google Cloud Vision API
 * @param imagePath - Path to the image file
 * @returns Analysis results including labels, objects, and detected text
 */
export async function analyzeImage(imagePath: string): Promise<VisionAnalysisResult | null> {
	const client = visionClient;
	
	if (!client) {
		console.warn('Vision API not available, skipping image analysis');
		return null;
	}

	try {
		const absolutePath = path.resolve(imagePath);
		console.log(`🔍 Analyzing image: ${absolutePath}`);

		const labels: Array<{ name: string; confidence: number }> = [];
		const objects: Array<{ name: string; confidence: number }> = [];
		let detectedText: string | undefined = undefined;

		// Label detection
		try {
			const [result] = await client.labelDetection(absolutePath);
			if (result?.labelAnnotations) {
				for (const label of result.labelAnnotations) {
					if (label.description && label.score && label.score > 0.7) {
						labels.push({ name: label.description, confidence: label.score });
					}
				}
			}
		} catch (error) {
			console.warn('Label detection failed:', error);
		}

		// Object localization
		try {
			if (client.objectLocalization) {
				const [result] = await client.objectLocalization(absolutePath);
				if (result?.localizedObjectAnnotations) {
					for (const obj of result.localizedObjectAnnotations) {
						if (obj.name && obj.score && obj.score > 0.5) {
							objects.push({ name: obj.name, confidence: obj.score });
						}
					}
				}
			}
		} catch (error) {
			console.warn('Object detection failed:', error);
		}

		// Text detection
		try {
			const [result] = await client.textDetection(absolutePath);
			if (result?.fullTextAnnotation?.text) {
				detectedText = result.fullTextAnnotation.text;
			}
		} catch (error) {
			console.warn('Text detection failed:', error);
		}

		// Generate a suggested description from the top labels and objects
		const suggestedDescription = generateDescription(labels, objects, detectedText);

		const result = {
			labels: labels.slice(0, 10), // Top 10 labels
			objects: objects.slice(0, 5), // Top 5 objects
			detectedText,
			suggestedDescription,
		};

		console.log(`✓ Vision analysis complete:`, {
			labelsFound: result.labels.length,
			objectsFound: result.objects.length,
			textDetected: !!result.detectedText,
		});

		return result;
	} catch (error) {
		console.error('Error analyzing image with Vision API:', error);
		return null;
	}
}

/**
 * Generate a natural description from detected labels and objects
 */
function generateDescription(
	labels: Array<{ name: string; confidence: number }>,
	objects: Array<{ name: string; confidence: number }>,
	detectedText?: string
): string {
	const parts: string[] = [];

	// Add detected objects
	if (objects.length > 0) {
		const objectNames = objects.slice(0, 3).map(o => o.name.toLowerCase());
		parts.push(objectNames.join(', '));
	}

	// Add key labels that aren't already in objects
	const objectSet = new Set(objects.map(o => o.name.toLowerCase()));
	const uniqueLabels = labels
		.filter(l => !objectSet.has(l.name.toLowerCase()))
		.slice(0, 3)
		.map(l => l.name.toLowerCase());
	
	if (uniqueLabels.length > 0) {
		parts.push(...uniqueLabels);
	}

	// If text detected, mention it
	if (detectedText && detectedText.trim().length > 0) {
		const textSnippet = detectedText.trim().slice(0, 50);
		if (textSnippet.toLowerCase().includes('error') || 
			textSnippet.toLowerCase().includes('warning') ||
			textSnippet.toLowerCase().includes('fail')) {
			parts.push('with visible error message');
		}
	}

	// Build description
	if (parts.length === 0) {
		return 'Item requiring attention';
	}

	const description = parts.slice(0, 5).join(', ');
	return description.charAt(0).toUpperCase() + description.slice(1);
}
