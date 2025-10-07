const fs = require('fs');
const { JSDOM } = require('jsdom');

class ContentValidator {
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
        console.log('📝 === PRUEBAS DE CONTENIDO PERSONALIZADO ===\n');
        
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
        
        console.log(`\n📊 Puntuación Contenido: ${this.score}/${this.maxScore} (${Math.round((this.score/this.maxScore)*100)}%)\n`);
        return { score: this.score, maxScore: this.maxScore };
    }
}

async function validateContent() {
    const validator = new ContentValidator();
    let dom;
    
    // Cargar HTML
    try {
        const html = fs.readFileSync('index.html', 'utf8');
        dom = new JSDOM(html);
    } catch (error) {
        console.error('❌ No se pudo cargar index.html');
        return { score: 0, maxScore: 100 };
    }
    
    const document = dom.window.document;
    
    // Placeholders que NO deben estar en el contenido final
    const placeholders = [
        '[Tu Nombre]',
        '[Tu Nombre Completo]',
        '[Escribe aquí]',
        '[Habilidad 1]',
        '[Habilidad 2]',
        '[Habilidad 3]',
        '[Agrega más habilidades]',
        '[Nombre de tu institución]',
        '[Tu carrera]',
        '[Año]',
        'tu-email@ejemplo.com',
        'tu-perfil',
        'tu-usuario',
        'Descripción breve',
        'descripción personal profesional'
    ];
    
    // Verificar que el nombre esté personalizado
    validator.addTest('Nombre personalizado en h1', 8, () => {
        const h1 = document.querySelector('h1');
        const text = h1?.textContent?.trim();
        const hasPlaceholder = text && placeholders.some(p => text.includes(p));
        const isPersonalized = text && text.length > 5 && !hasPlaceholder;
        
        return {
            passed: isPersonalized,
            message: isPersonalized ? `Nombre encontrado: "${text}"` : 'H1 contiene placeholders o está vacío'
        };
    });
    
    // Verificar título de la página personalizado
    validator.addTest('Título de página personalizado', 5, () => {
        const title = document.querySelector('title');
        const text = title?.textContent?.trim();
        const hasPlaceholder = text && placeholders.some(p => text.includes(p));
        const isPersonalized = text && text.length > 10 && !hasPlaceholder;
        
        return {
            passed: isPersonalized,
            message: isPersonalized ? `Título: "${text}"` : 'Título contiene placeholders o es muy genérico'
        };
    });
    
    // Verificar descripción "Acerca de mí"
    validator.addTest('Descripción "Acerca de mí" personalizada', 10, () => {
        const section = document.querySelector('#acerca-de');
        const p = section?.querySelector('p');
        const text = p?.textContent?.trim();
        const hasPlaceholder = text && placeholders.some(p => text.includes(p));
        const isPersonalized = text && text.length > 50 && !hasPlaceholder && 
                              !text.includes('Escribe aquí') && 
                              !text.includes('descripción breve');
        
        return {
            passed: isPersonalized,
            message: isPersonalized ? 
                    `Descripción personalizada (${text.length} caracteres)` : 
                    'Descripción contiene placeholders o es muy corta'
        };
    });
    
    // Verificar habilidades personalizadas
    validator.addTest('Lista de habilidades personalizada', 8, () => {
        const ul = document.querySelector('#habilidades');
        const lis = ul?.querySelectorAll('li');
        
        if (!lis || lis.length < 3) {
            return { passed: false, message: 'Menos de 3 habilidades encontradas' };
        }
        
        const personalizedSkills = Array.from(lis).filter(li => {
            const text = li.textContent?.trim();
            return text && text.length > 2 && !placeholders.some(p => text.includes(p));
        });
        
        const isPersonalized = personalizedSkills.length >= 3;
        
        return {
            passed: isPersonalized,
            message: isPersonalized ? 
                    `${personalizedSkills.length} habilidades personalizadas encontradas` : 
                    'Habilidades contienen placeholders o son muy genéricas'
        };
    });
    
    // Verificar información de educación
    validator.addTest('Información de educación personalizada', 8, () => {
        const section = document.querySelector('#educacion');
        const h3 = section?.querySelector('h3');
        const text = h3?.textContent?.trim();
        const hasPlaceholder = text && placeholders.some(p => text.includes(p));
        const isPersonalized = text && text.length > 5 && !hasPlaceholder;
        
        return {
            passed: isPersonalized,
            message: isPersonalized ? 
                    `Institución: "${text}"` : 
                    'Información educativa contiene placeholders'
        };
    });
    
    // Verificar email personalizado
    validator.addTest('Email de contacto personalizado', 6, () => {
        const mailtoLink = document.querySelector('a[href^="mailto:"]');
        const href = mailtoLink?.getAttribute('href');
        const email = href?.replace('mailto:', '');
        const isPersonalized = email && 
                              email !== 'tu-email@ejemplo.com' && 
                              email.includes('@') && 
                              email.includes('.');
        
        return {
            passed: isPersonalized,
            message: isPersonalized ? 
                    `Email: ${email}` : 
                    'Email no personalizado o inválido'
        };
    });
    
    // Verificar enlaces de redes sociales
    validator.addTest('Enlaces de redes sociales personalizados', 6, () => {
        const externalLinks = document.querySelectorAll('a[target="_blank"]');
        const personalizedLinks = Array.from(externalLinks).filter(link => {
            const href = link.getAttribute('href');
            return href && 
                   !href.includes('tu-perfil') && 
                   !href.includes('tu-usuario') &&
                   (href.includes('linkedin.com') || href.includes('github.com') || href.includes('twitter.com'));
        });
        
        const isPersonalized = personalizedLinks.length >= 1;
        
        return {
            passed: isPersonalized,
            message: isPersonalized ? 
                    `${personalizedLinks.length} enlaces personalizados encontrados` : 
                    'Enlaces de redes sociales no personalizados'
        };
    });
    
    // Verificar que la imagen tiene ruta personalizada
    validator.addTest('Imagen de perfil con ruta personalizada', 4, () => {
        const img = document.querySelector('#foto-perfil');
        const src = img?.getAttribute('src');
        const alt = img?.getAttribute('alt');
        const hasPersonalizedSrc = src && src.startsWith('assets/images/') && !src.includes('tu-foto.jpg');
        const hasPersonalizedAlt = alt && !placeholders.some(p => alt.includes(p));
        
        return {
            passed: hasPersonalizedSrc || hasPersonalizedAlt,
            message: (hasPersonalizedSrc || hasPersonalizedAlt) ? 
                    'Imagen personalizada' : 
                    'Imagen mantiene valores por defecto'
        };
    });
    
    // Verificar longitud general del contenido
    validator.addTest('Contenido sustancial en el HTML. Tu perfil debe tener más de 100 palabras.', 5, () => {
        const bodyText = document.body?.textContent?.trim();
        // Filtrar palabras vacías y contar solo palabras con contenido real
        const wordCount = bodyText ? bodyText.split(/\s+/).filter(word => word.length > 0).length : 0;
        const isSubstantial = wordCount > 100;
        
        return {
            passed: isSubstantial,
            message: isSubstantial ? 
                    `${wordCount} palabras en total` : 
                    `Contenido insuficiente: ${wordCount} palabras`
        };
    });
    
    // Verificar que no hay contenido en español genérico
    validator.addTest('Contenido en español profesional', 4, () => {
        const bodyText = document.body?.textContent?.toLowerCase();
        const hasGenericSpanish = bodyText && 
                                 (bodyText.includes('lorem ipsum') || 
                                  bodyText.includes('texto de prueba') ||
                                  bodyText.includes('contenido de ejemplo'));
        
        return {
            passed: !hasGenericSpanish,
            message: !hasGenericSpanish ? 
                    'Contenido profesional en español' : 
                    'Contenido contiene texto genérico o de prueba'
        };
    });
    
    // Verificar estructura semántica
    validator.addTest('Uso apropiado de elementos semánticos', 6, () => {
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        const sections = document.querySelectorAll('section');
        const footer = document.querySelector('footer');
        
        const hasSemanticStructure = header && main && sections.length >= 3 && footer;
        
        return {
            passed: hasSemanticStructure,
            message: hasSemanticStructure ? 
                    `Estructura semántica correcta (${sections.length} secciones)` : 
                    'Estructura semántica incompleta'
        };
    });
    
    return await validator.runTests();
}

module.exports = validateContent;

// Si se ejecuta directamente
if (require.main === module) {
    validateContent().catch(console.error);
}