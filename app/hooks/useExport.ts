import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Speech from 'expo-speech';
import { useCallback } from 'react';
import { captureRef } from 'react-native-view-shot';

import { Platform } from 'react-native';

import { useToast } from './useToast';

interface ChartData {
    type: 'line' | 'bar' | 'pie';
    data: Record<string, string | number>[];
    svg?: string;
    imageUri?: string;
}

interface ExportOptions {
    includePhotos?: boolean;
    includeCharts?: boolean;
    includeComments?: boolean;
}

interface ExportData {
    title: string;
    content: string;
    photos?: string[];
    charts?: ChartData[];
    comments?: string[];
    type: 'journal' | 'seed';
}

export const useExport = () => {
    const { showToast } = useToast();

    const generatePDF = useCallback(async (data: ExportData, options: ExportOptions = {}) => {
        try {
            const { title, content, photos, charts, comments, type } = data;
            const { includePhotos = true, includeCharts = true, includeComments = true } = options;

            // Generate HTML content
            let htmlContent = `
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                        <style>
                            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; }
                            h1 { color: #2c3e50; margin-bottom: 20px; }
                            .content { margin-bottom: 20px; line-height: 1.6; }
                            .photo { max-width: 100%; margin: 10px 0; border-radius: 8px; }
                            .chart { margin: 20px 0; }
                            .comments { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
                            .comment { margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
                        </style>
                    </head>
                    <body>
                        <h1>${title}</h1>
                        <div class="content">${content}</div>
            `;

            // Add photos if included
            if (includePhotos && photos?.length) {
                htmlContent += '<h2>Photos</h2>';
                photos.forEach(photo => {
                    htmlContent += `<img class="photo" src="${photo}" />`;
                });
            }

            // Add charts if included
            if (includeCharts && charts?.length) {
                htmlContent += '<h2>Charts</h2>';
                charts.forEach(chart => {
                    htmlContent += `<div class="chart">${chart.svg || `<img src="${chart.imageUri}" />`}</div>`;
                });
            }

            // Add comments if included
            if (includeComments && comments?.length) {
                htmlContent += '<div class="comments"><h2>Comments</h2>';
                comments.forEach(comment => {
                    htmlContent += `<div class="comment">${comment}</div>`;
                });
                htmlContent += '</div>';
            }

            htmlContent += '</body></html>';

            // Generate PDF
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                width: 612, // US Letter width in points
                height: 792, // US Letter height in points
            });

            return uri;
        } catch (error) {
            console.error('PDF generation failed:', error);
            throw error;
        }
    }, []);

    const generateSnapshot = useCallback(async <T extends Element>(viewRef: React.RefObject<T>) => {
        try {
            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 1,
            });
            return uri;
        } catch (error) {
            console.error('Snapshot generation failed:', error);
            throw error;
        }
    }, []);

    const shareFile = useCallback(async (uri: string, type: 'pdf' | 'image') => {
        try {
            if (!(await Sharing.isAvailableAsync())) {
                throw new Error('Sharing is not available on this device');
            }

            const mimeType = type === 'pdf' ? 'application/pdf' : 'image/png';
            // Filename is generated but not used directly by the Sharing API
            const _filename = `plantify-${type}-${Date.now()}.${type === 'pdf' ? 'pdf' : 'png'}`;

            await Sharing.shareAsync(uri, {
                mimeType,
                dialogTitle: 'Share your plant data',
                UTI: type === 'pdf' ? 'com.adobe.pdf' : 'public.png',
            });

            const message = `${type.toUpperCase()} exported successfully`;
            showToast('success', message);
            Speech.speak(message, {
                language: 'en',
                pitch: 1,
                rate: 0.9,
            });
        } catch (error) {
            console.error('Sharing failed:', error);
            showToast('error', 'Failed to share file');
            throw error;
        }
    }, [showToast]);

    return {
        generatePDF,
        generateSnapshot,
        shareFile,
    };
}; 