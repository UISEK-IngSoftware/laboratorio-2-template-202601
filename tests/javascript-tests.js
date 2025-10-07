const fs = require('fs');
const { JSDOM } = require('jsdom');

class JavaScriptValidator {
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
        console.log('⚡ === PRUEBAS DE FUNCIONALIDAD JAVASCRIPT ===\n');
        
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
        
        console.log(`\n📊 Puntuación JavaScript: ${this.score}/${this.maxScore} (${Math.round((this.score/this.maxScore)*100)}%)\n`);
        return { score: this.score, maxScore: this.maxScore };
    }
}

async function validateJavaScript() {
    const validator = new JavaScriptValidator();
    
    // Verificar que existe el archivo HTML
    if (!fs.existsSync('index.html')) {
        console.error('❌ Archivo index.html no encontrado');
        return { score: 0, maxScore: 100 };
    }
    
    // Verificar que existe el archivo JavaScript
    validator.addTest('Archivo JavaScript existe y es accesible', 5, () => {
        const exists = fs.existsSync('assets/js/scripts.js');
        return {
            passed: exists,
            message: exists ? 'Archivo JavaScript encontrado' : 'Archivo assets/js/scripts.js no encontrado'
        };
    });
    
    // Verificar contenido del JavaScript - DOMContentLoaded
    validator.addTest('JavaScript contiene DOMContentLoaded', 8, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const hasDOMReady = js.includes('DOMContentLoaded') && js.includes('addEventListener');
            return {
                passed: hasDOMReady,
                message: hasDOMReady ? 'DOMContentLoaded encontrado' : 'No se encontró addEventListener con DOMContentLoaded'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo JavaScript' };
        }
    });
    
    // Verificar que obtiene elementos por ID para habilidades
    validator.addTest('JavaScript obtiene elementos de habilidades', 10, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const hasToggleHabilidades = js.includes('toggle-habilidades') && js.includes('getElementById');
            const hasHabilidades = js.includes('habilidades') && js.includes('getElementById');
            
            const bothPresent = hasToggleHabilidades && hasHabilidades;
            return {
                passed: bothPresent,
                message: bothPresent ? 
                    'Referencias a elementos de habilidades encontradas' : 
                    `toggle-habilidades: ${hasToggleHabilidades}, habilidades: ${hasHabilidades}`
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo JavaScript' };
        }
    });
    
    // Verificar que obtiene elementos por ID para educación
    validator.addTest('JavaScript obtiene elementos de educación', 10, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const hasToggleEducacion = js.includes('toggle-educacion') && js.includes('getElementById');
            const hasEducacion = js.includes('educacion') && js.includes('getElementById');
            
            const bothPresent = hasToggleEducacion && hasEducacion;
            return {
                passed: bothPresent,
                message: bothPresent ? 
                    'Referencias a elementos de educación encontradas' : 
                    `toggle-educacion: ${hasToggleEducacion}, educacion: ${hasEducacion}`
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo JavaScript' };
        }
    });
    
    // Verificar event listeners para clicks
    validator.addTest('JavaScript contiene event listeners para clicks', 12, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const hasAddEventListener = js.includes('addEventListener');
            const hasClickEvent = js.includes('click');
            const clickListeners = (js.match(/addEventListener.*['"]click['"]/g) || []).length;
            
            const hasValidListeners = hasAddEventListener && hasClickEvent && clickListeners >= 2;
            return {
                passed: hasValidListeners,
                message: hasValidListeners ? 
                    `${clickListeners} event listeners para click encontrados` : 
                    `addEventListener: ${hasAddEventListener}, click: ${hasClickEvent}, cantidad: ${clickListeners}`
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo JavaScript' };
        }
    });
    
    // Verificar manipulación de classList
    validator.addTest('JavaScript manipula classList para toggle', 15, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const hasClassList = js.includes('classList');
            const hasToggleLogic = js.includes('toggle') || (js.includes('add') && js.includes('remove'));
            const hasOcultoOrVisible = js.includes('oculto') || js.includes('visible');
            
            const isComplete = hasClassList && hasToggleLogic && hasOcultoOrVisible;
            return {
                passed: isComplete,
                message: isComplete ? 
                    'Manipulación de classList para toggle encontrada' : 
                    `classList: ${hasClassList}, toggle/add/remove: ${hasToggleLogic}, oculto/visible: ${hasOcultoOrVisible}`
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo JavaScript' };
        }
    });
    
    // Verificar que elementos HTML necesarios existen
    validator.addTest('Elementos HTML necesarios están presentes', 8, () => {
        try {
            const html = fs.readFileSync('index.html', 'utf8');
            const dom = new JSDOM(html);
            const document = dom.window.document;
            
            const elements = {
                toggleHabilidades: !!document.getElementById('toggle-habilidades'),
                habilidades: !!document.getElementById('habilidades'),
                toggleEducacion: !!document.getElementById('toggle-educacion'),
                educacion: !!document.getElementById('educacion')
            };
            
            const allPresent = Object.values(elements).every(exists => exists);
            return {
                passed: allPresent,
                message: allPresent ? 
                    'Todos los elementos HTML necesarios presentes' : 
                    `Elementos faltantes: ${Object.entries(elements).filter(([key, value]) => !value).map(([key]) => key).join(', ')}`
            };
        } catch (error) {
            return { passed: false, message: `Error verificando HTML: ${error.message}` };
        }
    });
    
    // Verificar que JavaScript tiene console.log para debugging
    validator.addTest('JavaScript contiene console.log para debugging', 6, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const hasConsoleLog = js.includes('console.log');
            const logCount = (js.match(/console\.log/g) || []).length;
            
            return {
                passed: hasConsoleLog && logCount >= 2,
                message: hasConsoleLog ? 
                    `${logCount} console.log encontrados` : 
                    'No se encontraron console.log para debugging'
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo leer el archivo JavaScript' };
        }
    });
    
    // Verificar tamaño y complejidad del JavaScript
    validator.addTest('JavaScript tiene contenido sustancial', 4, () => {
        try {
            const js = fs.readFileSync('assets/js/scripts.js', 'utf8');
            const lineCount = js.split('\n').filter(line => line.trim().length > 0).length;
            const hasSubstantialContent = js.length > 400 && lineCount > 10;
            
            return {
                passed: hasSubstantialContent,
                message: hasSubstantialContent ? 
                    `JavaScript sustancial: ${js.length} chars, ${lineCount} líneas` : 
                    `JavaScript insuficiente: ${js.length} chars, ${lineCount} líneas (mínimo: 400 chars, 10 líneas)`
            };
        } catch (error) {
            return { passed: false, message: 'No se pudo verificar el contenido JavaScript' };
        }
    });
    
    return await validator.runTests();
}

module.exports = validateJavaScript;

// Si se ejecuta directamente
if (require.main === module) {
    validateJavaScript().catch(console.error);
}