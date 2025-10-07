const fs = require('fs');
const path = require('path');

class AssetsValidator {
    constructor() {
        this.tests = [];
        this.score = 0;
        this.maxScore = 0;
    }

    addTest(name, points, testFunction) {
        this.tests.push({ name, points, testFunction });
        this.maxScore += points;
    }

    async runTests() {
        console.log('🔗 === PRUEBAS DE ESTRUCTURA Y ENLACES ===\n');
        
        for (const test of this.tests) {
            try {
                const result = await test.testFunction();
                if (result.passed) {
                    console.log(`✅ ${test.name} (${test.points}/${test.points} puntos)`);
                    this.score += test.points;
                } else {
                    console.log(`❌ ${test.name} (0/${test.points} puntos)`);
                    console.log(`   📝 ${result.message}`);
                }
            } catch (error) {
                console.log(`❌ ${test.name} (0/${test.points} puntos)`);
                console.log(`   🚨 Error: ${error.message}`);
            }
        }
        
        console.log(`\n📊 Puntuación Assets: ${this.score}/${this.maxScore} (${Math.round((this.score/this.maxScore)*100)}%)\n`);
        return { score: this.score, maxScore: this.maxScore };
    }
}

async function validateAssets() {
    const validator = new AssetsValidator();
    
    // Verificar estructura de carpetas
    validator.addTest('Carpeta assets existe', 5, () => {
        const exists = fs.existsSync('assets') && fs.statSync('assets').isDirectory();
        return {
            passed: exists,
            message: exists ? 'Carpeta assets encontrada' : 'Carpeta assets no encontrada'
        };
    });
    
    validator.addTest('Carpeta assets/css existe', 3, () => {
        const exists = fs.existsSync('assets/css') && fs.statSync('assets/css').isDirectory();
        return {
            passed: exists,
            message: exists ? 'Carpeta assets/css encontrada' : 'Carpeta assets/css no encontrada'
        };
    });
    
    validator.addTest('Carpeta assets/js existe', 3, () => {
        const exists = fs.existsSync('assets/js') && fs.statSync('assets/js').isDirectory();
        return {
            passed: exists,
            message: exists ? 'Carpeta assets/js encontrada' : 'Carpeta assets/js no encontrada'
        };
    });
    
    validator.addTest('Carpeta assets/images existe', 2, () => {
        const exists = fs.existsSync('assets/images') && fs.statSync('assets/images').isDirectory();
        return {
            passed: exists,
            message: exists ? 'Carpeta assets/images encontrada' : 'Carpeta assets/images no encontrada (requerida para foto de perfil)'
        };
    });
    
    validator.addTest('Foto de perfil existe en assets/images', 5, () => {
        try {
            const imagesDir = 'assets/images';
            if (!fs.existsSync(imagesDir)) {
                return { passed: false, message: 'Carpeta assets/images no existe' };
            }
            
            const files = fs.readdirSync(imagesDir);
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const imageFiles = files.filter(file => 
                imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
            );
            
            const hasImages = imageFiles.length > 0;
            return {
                passed: hasImages,
                message: hasImages ? 
                    `Foto(s) encontrada(s): ${imageFiles.join(', ')}` : 
                    'No se encontró ninguna imagen en assets/images (formatos válidos: jpg, jpeg, png, gif, webp)'
            };
        } catch (error) {
            return { passed: false, message: 'Error al verificar carpeta de imágenes' };
        }
    });
    
    validator.addTest('Imagen de perfil referenciada en HTML', 4, () => {
        try {
            const html = fs.readFileSync('index.html', 'utf8');
            const hasImageRef = html.includes('assets/images/') && 
                              html.includes('<img') &&
                              html.includes('id="foto-perfil"');
            return {
                passed: hasImageRef,
                message: hasImageRef ? 
                    'Referencia a imagen en assets/images/ encontrada en HTML' : 
                    'No se encontró referencia a imagen en assets/images/ con id="foto-perfil"'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo verificar referencias de imagen en HTML' };
        }
    });
    
    // Verificar archivos CSS
    validator.addTest('Archivo styles.css existe', 5, () => {
        const exists = fs.existsSync('assets/css/styles.css');
        return {
            passed: exists,
            message: exists ? 'Archivo styles.css encontrado' : 'Archivo assets/css/styles.css no encontrado'
        };
    });
    
    validator.addTest('CSS contiene reset básico', 4, () => {
        try {
            const css = fs.readFileSync('assets/css/styles.css', 'utf8');
            const hasReset = css.includes('margin: 0') && 
                           css.includes('padding: 0') && 
                           css.includes('box-sizing: border-box');
            return {
                passed: hasReset,
                message: hasReset ? 'Reset CSS encontrado' : 'Reset CSS no encontrado (* { margin: 0; padding: 0; box-sizing: border-box; })'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo CSS' };
        }
    });
    
    validator.addTest('CSS contiene estilos para body', 3, () => {
        try {
            const css = fs.readFileSync('assets/css/styles.css', 'utf8');
            const hasBodyStyles = css.includes('body') && 
                                (css.includes('font-family') || css.includes('color') || css.includes('background'));
            return {
                passed: hasBodyStyles,
                message: hasBodyStyles ? 'Estilos de body encontrados' : 'No se encontraron estilos para body'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo CSS' };
        }
    });
    
    validator.addTest('CSS contiene clases para JavaScript (.oculto, .visible)', 4, () => {
        try {
            const css = fs.readFileSync('assets/css/styles.css', 'utf8');
            const hasJSClasses = css.includes('.oculto') && css.includes('.visible');
            return {
                passed: hasJSClasses,
                message: hasJSClasses ? 'Clases para JavaScript encontradas' : 'Clases .oculto y .visible no encontradas'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo CSS' };
        }
    });
    
    validator.addTest('CSS contiene estilos para elementos interactivos', 3, () => {
        try {
            const css = fs.readFileSync('assets/css/styles.css', 'utf8');
            const hasInteractiveStyles = css.includes('#toggle-habilidades') || 
                                       css.includes('#toggle-educacion') ||
                                       css.includes('cursor: pointer');
            return {
                passed: hasInteractiveStyles,
                message: hasInteractiveStyles ? 'Estilos interactivos encontrados' : 'No se encontraron estilos para elementos interactivos'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo CSS' };
        }
    });
    
    validator.addTest('CSS contiene estilos para footer', 4, () => {
        try {
            const css = fs.readFileSync('assets/css/styles.css', 'utf8');
            const hasFooterStyles = css.includes('footer') && 
                                  (css.includes('background-color') || css.includes('padding') || css.includes('text-align'));
            return {
                passed: hasFooterStyles,
                message: hasFooterStyles ? 'Estilos de footer encontrados' : 'No se encontraron estilos específicos para footer'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo CSS' };
        }
    });
    
    validator.addTest('CSS contiene estilos para enlaces del footer', 3, () => {
        try {
            const css = fs.readFileSync('assets/css/styles.css', 'utf8');
            const hasFooterLinkStyles = (css.includes('footer a') || css.includes('footer') && css.includes('a')) &&
                                      (css.includes('color') || css.includes('text-decoration') || css.includes('hover'));
            return {
                passed: hasFooterLinkStyles,
                message: hasFooterLinkStyles ? 'Estilos de enlaces del footer encontrados' : 'No se encontraron estilos para enlaces del footer'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo CSS' };
        }
    });
    
    validator.addTest('CSS contiene media queries para responsive design', 5, () => {
        try {
            const css = fs.readFileSync('assets/css/styles.css', 'utf8');
            const hasMediaQueries = css.includes('@media') && 
                                  (css.includes('max-width') || css.includes('min-width'));
            return {
                passed: hasMediaQueries,
                message: hasMediaQueries ? 'Media queries encontradas' : 'No se encontraron media queries para responsive design'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo CSS' };
        }
    });
    
    validator.addTest('CSS responsive contiene breakpoint para móviles', 3, () => {
        try {
            const css = fs.readFileSync('assets/css/styles.css', 'utf8');
            const hasMobileBreakpoint = css.includes('@media') && 
                                      (css.includes('768px') || css.includes('600px') || css.includes('480px'));
            return {
                passed: hasMobileBreakpoint,
                message: hasMobileBreakpoint ? 'Breakpoint para móviles encontrado' : 'No se encontró breakpoint específico para móviles (768px, 600px, 480px)'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo CSS' };
        }
    });
    
    // Verificar archivo JavaScript
    validator.addTest('Archivo scripts.js existe', 5, () => {
        const exists = fs.existsSync('assets/js/scripts.js');
        return {
            passed: exists,
            message: exists ? 'Archivo scripts.js encontrado' : 'Archivo assets/js/scripts.js no encontrado'
        };
    });
    
    validator.addTest('JavaScript contiene DOMContentLoaded', 4, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const hasDOMReady = js.includes('DOMContentLoaded') || js.includes('addEventListener');
            return {
                passed: hasDOMReady,
                message: hasDOMReady ? 'Event listener DOMContentLoaded encontrado' : 'No se encontró DOMContentLoaded o addEventListener'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo JavaScript' };
        }
    });
    
    validator.addTest('JavaScript contiene getElementById para habilidades', 4, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const hasHabilidadesID = js.includes('toggle-habilidades') && js.includes('habilidades');
            return {
                passed: hasHabilidadesID,
                message: hasHabilidadesID ? 'Referencias a elementos de habilidades encontradas' : 'No se encontraron referencias a toggle-habilidades o habilidades'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo JavaScript' };
        }
    });
    
    validator.addTest('JavaScript contiene getElementById para educación', 4, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const hasEducacionID = js.includes('toggle-educacion') && js.includes('educacion');
            return {
                passed: hasEducacionID,
                message: hasEducacionID ? 'Referencias a elementos de educación encontradas' : 'No se encontraron referencias a toggle-educacion o educacion'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo JavaScript' };
        }
    });
    
    validator.addTest('JavaScript contiene addEventListener para clicks', 4, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const hasClickEvents = js.includes('addEventListener') && js.includes('click');
            return {
                passed: hasClickEvents,
                message: hasClickEvents ? 'Event listeners para clicks encontrados' : 'No se encontraron event listeners para clicks'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo JavaScript' };
        }
    });
    
    validator.addTest('JavaScript contiene manipulación de classList', 3, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const hasClassList = js.includes('classList') && (js.includes('toggle') || js.includes('add') || js.includes('remove'));
            return {
                passed: hasClassList,
                message: hasClassList ? 'Manipulación de classList encontrada' : 'No se encontró manipulación de classList'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo JavaScript' };
        }
    });
    
    // Verificar tamaño mínimo de archivos (contenido no vacío)
    validator.addTest('CSS tiene contenido sustancial (>500 chars)', 2, () => {
        try {
            const css = fs.readFileSync('assets/css/styles.css', 'utf8');
            const hasContent = css.length > 500;
            return {
                passed: hasContent,
                message: hasContent ? `CSS tiene ${css.length} caracteres` : `CSS muy corto: ${css.length} caracteres`
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo CSS' };
        }
    });
    
    validator.addTest('JavaScript tiene contenido sustancial (>300 chars)', 2, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const hasContent = js.length > 300;
            return {
                passed: hasContent,
                message: hasContent ? `JavaScript tiene ${js.length} caracteres` : `JavaScript muy corto: ${js.length} caracteres`
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo JavaScript' };
        }
    });
    
    return await validator.runTests();
}

module.exports = validateAssets;

// Si se ejecuta directamente
if (require.main === module) {
    validateAssets().catch(console.error);
}