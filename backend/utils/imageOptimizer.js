const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageOptimizer {
    constructor(uploadDir) {
        this.uploadDir = uploadDir;
        this.sizes = {
            thumbnail: { width: 150, height: 150 },
            small: { width: 400, height: 300 },
            medium: { width: 800, height: 600 },
            large: { width: 1200, height: 800 }
        };
    }

    async optimize(inputPath, filename) {
        try {
            const ext = path.extname(filename);
            const name = path.basename(filename, ext);
            const variants = [];

            // Criar versões otimizadas
            for (const [size, dimensions] of Object.entries(this.sizes)) {
                const outputPath = path.join(
                    this.uploadDir, 
                    'optimized', 
                    `${name}-${size}.webp`
                );

                await sharp(inputPath)
                    .resize(dimensions.width, dimensions.height, { 
                        fit: 'inside',
                        withoutEnlargement: true 
                    })
                    .webp({ quality: 80 })
                    .toFile(outputPath);

                variants.push({
                    size,
                    url: `/uploads/optimized/${name}-${size}.webp`,
                    width: dimensions.width,
                    height: dimensions.height
                });
            }

            // Criar versão WebP original
            const webpPath = path.join(this.uploadDir, 'optimized', `${name}.webp`);
            await sharp(inputPath)
                .webp({ quality: 85 })
                .toFile(webpPath);

            variants.push({
                size: 'original',
                url: `/uploads/optimized/${name}.webp`,
                width: null,
                height: null
            });

            return variants;
        } catch (error) {
            console.error('Erro na otimização de imagem:', error);
            return null;
        }
    }

    async getDimensions(inputPath) {
        try {
            const metadata = await sharp(inputPath).metadata();
            return {
                width: metadata.width,
                height: metadata.height
            };
        } catch (error) {
            return null;
        }
    }
}

module.exports = { ImageOptimizer };
