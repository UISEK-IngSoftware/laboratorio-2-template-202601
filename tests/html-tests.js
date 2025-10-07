const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

class HTMLValidator {
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
        console.log('🔍 === PRUEBAS DE ESTRUCTURA HTML ===\n');
        
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
        
        console.log(`\n📊 Puntuación HTML: ${this.score}/${this.maxScore} (${Math.round((this.score/this.maxScore)*100)}%)\n`);
        return { score: this.score, maxScore: this.maxScore };
    }
}

async function validateHTML() {
    const validator = new HTMLValidator();
    
    // Verificar que existe index.html
    validator.addTest('Archivo index.html existe', 5, () => {
        const exists = fs.existsSync('index.html');
        return {
            passed: exists,
            message: exists ? 'Archivo encontrado' : 'Archivo index.html no encontrado en la raíz del proyecto'
        };
    });
    
    // Cargar y parsear HTML
    let dom;
    validator.addTest('HTML se puede parsear correctamente', 5, () => {
        try {
            const html = fs.readFileSync('index.html', 'utf8');
            dom = new JSDOM(html);
            return { passed: true, message: 'HTML parseado correctamente' };
        } catch (error) {
            return { passed: false, message: `Error al parsear HTML: ${error.message}` };
        }
    });
    
    // Verificar DOCTYPE HTML5
    validator.addTest('DOCTYPE HTML5 presente', 3, () => {
        const html = fs.readFileSync('index.html', 'utf8');
        const hasDoctype = html.trim().toLowerCase().startsWith('<!doctype html>');
        return {
            passed: hasDoctype,
            message: hasDoctype ? 'DOCTYPE HTML5 encontrado' : 'DOCTYPE HTML5 no encontrado al inicio del documento'
        };
    });
    
    // Verificar estructura básica
    validator.addTest('Estructura HTML básica (html, head, body)', 5, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const document = dom.window.document;
        const html = document.querySelector('html');
        const head = document.querySelector('head');
        const body = document.querySelector('body');
        
        const hasAll = html && head && body;
        return {
            passed: hasAll,
            message: hasAll ? 'Estructura básica correcta' : 'Faltan elementos básicos: html, head o body'
        };
    });
    
    // Verificar lang="es"
    validator.addTest('Atributo lang="es" en elemento html', 2, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const html = dom.window.document.querySelector('html');
        const lang = html?.getAttribute('lang');
        const isSpanish = lang === 'es';
        
        return {
            passed: isSpanish,
            message: isSpanish ? 'Idioma español configurado' : `Idioma configurado como "${lang}", debería ser "es"`
        };
    });
    
    // Verificar meta charset
    validator.addTest('Meta charset UTF-8', 2, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const metaCharset = dom.window.document.querySelector('meta[charset]');
        const charset = metaCharset?.getAttribute('charset')?.toLowerCase();
        const isUTF8 = charset === 'utf-8';
        
        return {
            passed: isUTF8,
            message: isUTF8 ? 'Charset UTF-8 configurado' : `Charset "${charset}", debería ser "utf-8"`
        };
    });
    
    // Verificar meta viewport
    validator.addTest('Meta viewport para responsive', 2, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const metaViewport = dom.window.document.querySelector('meta[name="viewport"]');
        const content = metaViewport?.getAttribute('content');
        const hasViewport = content && content.includes('width=device-width');
        
        return {
            passed: hasViewport,
            message: hasViewport ? 'Meta viewport configurado' : 'Meta viewport no encontrado o mal configurado'
        };
    });
    
    // Verificar título personalizado
    validator.addTest('Título personalizado (no genérico)', 3, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const title = dom.window.document.querySelector('title');
        const titleText = title?.textContent?.trim();
        const isCustom = titleText && 
                        !titleText.includes('[Tu Nombre]') && 
                        titleText.length > 10 &&
                        titleText.toLowerCase().includes('portafolio');
        
        return {
            passed: isCustom,
            message: isCustom ? 'Título personalizado encontrado' : 'Título no personalizado o muy genérico'
        };
    });
    
    // Verificar enlace CSS
    validator.addTest('Enlace a CSS correcto', 5, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const cssLink = dom.window.document.querySelector('link[rel="stylesheet"]');
        const href = cssLink?.getAttribute('href');
        const correctPath = href === 'assets/css/styles.css';
        
        return {
            passed: correctPath,
            message: correctPath ? 'Enlace CSS correcto' : `Enlace CSS: "${href}", debería ser "assets/css/styles.css"`
        };
    });
    
    // Verificar header con h1
    validator.addTest('Header con h1 personalizado', 4, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const header = dom.window.document.querySelector('header');
        const h1 = header?.querySelector('h1');
        const h1Text = h1?.textContent?.trim();
        const isPersonalized = h1Text && 
                               !h1Text.includes('[Tu Nombre]') && 
                               !h1Text.includes('Nombre Completo') &&
                               h1Text.length > 5;
        
        return {
            passed: isPersonalized,
            message: isPersonalized ? 'H1 personalizado encontrado' : 'H1 no personalizado o contiene placeholders'
        };
    });
    
    // Verificar imagen de perfil
    validator.addTest('Imagen de perfil con atributos correctos', 3, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const img = dom.window.document.querySelector('#foto-perfil');
        const src = img?.getAttribute('src');
        const alt = img?.getAttribute('alt');
        const hasCorrectAttributes = src && alt && 
                                   src.startsWith('assets/images/') &&
                                   !alt.includes('[Tu Nombre]');
        
        return {
            passed: hasCorrectAttributes,
            message: hasCorrectAttributes ? 'Imagen con atributos correctos' : 'Imagen sin atributos correctos o no personalizada'
        };
    });
    
    // Verificar main element
    validator.addTest('Elemento main presente', 3, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const main = dom.window.document.querySelector('main');
        return {
            passed: !!main,
            message: main ? 'Elemento main encontrado' : 'Elemento main no encontrado'
        };
    });
    
    // Verificar sección "Acerca de mí"
    validator.addTest('Sección "Acerca de mí" con contenido', 4, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const section = dom.window.document.querySelector('#acerca-de');
        const h2 = section?.querySelector('h2');
        const p = section?.querySelector('p');
        const hasContent = p?.textContent?.trim().length > 50 &&
                          !p?.textContent?.includes('Escribe aquí') &&
                          !p?.textContent?.includes('descripción personal');
        
        return {
            passed: hasContent,
            message: hasContent ? 'Sección "Acerca de mí" con contenido personalizado' : 'Sección "Acerca de mí" sin contenido personalizado'
        };
    });
    
    // Verificar sección habilidades
    validator.addTest('Sección habilidades con IDs correctos', 5, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const toggleHabilidades = dom.window.document.querySelector('#toggle-habilidades');
        const habilidades = dom.window.document.querySelector('#habilidades');
        const lis = habilidades?.querySelectorAll('li');
        const hasCustomSkills = lis && lis.length >= 3 &&
                               Array.from(lis).some(li => 
                                   !li.textContent.includes('[Habilidad') && 
                                   li.textContent.trim().length > 2
                               );
        
        return {
            passed: toggleHabilidades && habilidades && hasCustomSkills,
            message: (toggleHabilidades && habilidades && hasCustomSkills) ? 
                    'Sección habilidades correcta' : 
                    'Sección habilidades incompleta o sin personalizar'
        };
    });
    
    // Verificar sección educación
    validator.addTest('Sección educación con IDs correctos', 5, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const toggleEducacion = dom.window.document.querySelector('#toggle-educacion');
        const educacion = dom.window.document.querySelector('#educacion');
        const h3 = educacion?.querySelector('h3');
        const hasCustomContent = h3?.textContent && 
                                !h3.textContent.includes('[Nombre de tu institución]') &&
                                !h3.textContent.includes('institución');
        
        return {
            passed: toggleEducacion && educacion && hasCustomContent,
            message: (toggleEducacion && educacion && hasCustomContent) ? 
                    'Sección educación correcta' : 
                    'Sección educación incompleta o sin personalizar'
        };
    });
    
    // Verificar footer con enlaces
    validator.addTest('Footer con enlaces de contacto válidos', 4, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const footer = dom.window.document.querySelector('footer');
        const mailtoLink = footer?.querySelector('a[href^="mailto:"]');
        const externalLinks = footer?.querySelectorAll('a[target="_blank"]');
        const hasValidEmail = mailtoLink?.getAttribute('href') !== 'mailto:tu-email@ejemplo.com';
        
        return {
            passed: footer && mailtoLink && externalLinks && hasValidEmail,
            message: (footer && mailtoLink && externalLinks && hasValidEmail) ? 
                    'Footer con enlaces válidos' : 
                    'Footer sin enlaces válidos o no personalizados'
        };
    });
    
    // Verificar enlace JavaScript
    validator.addTest('Enlace a JavaScript correcto', 3, () => {
        if (!dom) return { passed: false, message: 'DOM no disponible' };
        
        const scriptTag = dom.window.document.querySelector('script[src]');
        const src = scriptTag?.getAttribute('src');
        const correctPath = src === 'assets/js/scripts.js';
        
        return {
            passed: correctPath,
            message: correctPath ? 'Enlace JavaScript correcto' : `Enlace JS: "${src}", debería ser "assets/js/scripts.js"`
        };
    });
    
    return await validator.runTests();
}

module.exports = validateHTML;

// Si se ejecuta directamente
if (require.main === module) {
    validateHTML().catch(console.error);
}