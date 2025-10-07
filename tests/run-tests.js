const fs = require('fs');
const validateHTML = require('./html-tests');
const validateAssets = require('./assets-tests');
const validateContent = require('./content-tests');
const validateJavaScript = require('./javascript-tests');

class GradeCalculator {
    constructor() {
        this.results = {
            html: { score: 0, maxScore: 0 },
            assets: { score: 0, maxScore: 0 },
            content: { score: 0, maxScore: 0 },
            javascript: { score: 0, maxScore: 0 }
        };
        this.weights = {
            html: 0.25,      // 25% - Estructura HTML
            assets: 0.20,    // 20% - Enlaces y organización
            content: 0.30,   // 30% - Contenido personalizado
            javascript: 0.25 // 25% - Funcionalidad JavaScript
        };
    }

    calculateGrade() {
        let totalWeightedScore = 0;
        let totalPossibleScore = 0;

        for (const [category, result] of Object.entries(this.results)) {
            if (result.maxScore > 0) {
                const percentage = result.score / result.maxScore;
                const weightedScore = percentage * this.weights[category] * 100;
                totalWeightedScore += weightedScore;
                totalPossibleScore += this.weights[category] * 100;
            }
        }

        return {
            finalGrade: Math.round(totalWeightedScore),
            maxGrade: Math.round(totalPossibleScore),
            percentage: Math.round((totalWeightedScore / totalPossibleScore) * 100),
            breakdown: this.getBreakdown()
        };
    }

    getBreakdown() {
        const breakdown = {};
        for (const [category, result] of Object.entries(this.results)) {
            const percentage = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
            breakdown[category] = {
                score: result.score,
                maxScore: result.maxScore,
                percentage: percentage,
                weight: Math.round(this.weights[category] * 100),
                points: Math.round((percentage * this.weights[category]))
            };
        }
        return breakdown;
    }

    getLetterGrade(percentage) {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    }

    generateReport() {
        const grade = this.calculateGrade();
        const letterGrade = this.getLetterGrade(grade.percentage);
        
        return {
            timestamp: new Date().toISOString(),
            finalGrade: {
                percentage: grade.percentage,
                letter: letterGrade,
                points: `${grade.finalGrade}/${grade.maxGrade}`
            },
            categories: grade.breakdown,
            summary: this.generateSummary(grade, letterGrade),
            recommendations: this.generateRecommendations(grade.breakdown)
        };
    }

    generateSummary(grade, letterGrade) {
        const messages = [];
        
        if (grade.percentage >= 90) {
            messages.push('🏆 ¡Excelente trabajo! Tu portafolio cumple con todos los requisitos.');
        } else if (grade.percentage >= 80) {
            messages.push('👏 ¡Buen trabajo! Tu portafolio está bien desarrollado.');
        } else if (grade.percentage >= 70) {
            messages.push('👍 Trabajo satisfactorio, pero hay áreas de mejora.');
        } else if (grade.percentage >= 60) {
            messages.push('⚠️ El trabajo cumple los requisitos mínimos.');
        } else {
            messages.push('❌ El trabajo necesita mejoras significativas.');
        }

        return {
            grade: letterGrade,
            percentage: grade.percentage,
            message: messages[0],
            status: grade.percentage >= 70 ? 'APROBADO' : 'NECESITA MEJORAS'
        };
    }

    generateRecommendations(breakdown) {
        const recommendations = [];

        for (const [category, data] of Object.entries(breakdown)) {
            if (data.percentage < 70) {
                switch (category) {
                    case 'html':
                        recommendations.push('📝 Revisa la estructura HTML: asegúrate de usar elementos semánticos correctos y que todos los IDs estén presentes.');
                        break;
                    case 'assets':
                        recommendations.push('🔗 Verifica los enlaces: revisa las rutas de CSS, JavaScript e imágenes en la carpeta assets.');
                        break;
                    case 'content':
                        recommendations.push('✏️ Personaliza el contenido: reemplaza todos los placeholders con tu información personal real.');
                        break;
                    case 'javascript':
                        recommendations.push('⚡ Mejora JavaScript: asegúrate de que los event listeners funcionen y no haya errores en la consola.');
                        break;
                }
            }
        }

        if (recommendations.length === 0) {
            recommendations.push('🎉 ¡No hay recomendaciones! Tu trabajo está completo.');
        }

        return recommendations;
    }
}

async function runAllTests() {
    console.log('🚀 === INICIANDO AUTOCALIFICACIÓN LABORATORIO 2 ===\n');
    console.log('📅 Fecha:', new Date().toLocaleString('es-ES'));
    console.log('📁 Directorio:', process.cwd());
    console.log('\n' + '='.repeat(60) + '\n');

    const calculator = new GradeCalculator();

    try {
        // Ejecutar todas las pruebas
        console.log('1️⃣ Ejecutando pruebas HTML...');
        calculator.results.html = await validateHTML();
        
        console.log('2️⃣ Ejecutando pruebas de Assets...');
        calculator.results.assets = await validateAssets();
        
        console.log('3️⃣ Ejecutando pruebas de Contenido...');
        calculator.results.content = await validateContent();
        
        console.log('4️⃣ Ejecutando pruebas de JavaScript...');
        calculator.results.javascript = await validateJavaScript();

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error.message);
    }

    // Generar reporte final
    const report = calculator.generateReport();
    
    // Mostrar resumen en consola
    console.log('\n' + '='.repeat(60));
    console.log('📊 === RESUMEN FINAL DE CALIFICACIÓN ===');
    console.log('='.repeat(60));
    
    console.log(`\\n🎯 CALIFICACIÓN FINAL: ${report.finalGrade.percentage}% (${report.finalGrade.letter})`);
    console.log(`📈 ESTADO: ${report.summary.status}`);
    console.log(`💬 ${report.summary.message}\\n`);
    
    console.log('📋 DESGLOSE POR CATEGORÍAS:');
    for (const [category, data] of Object.entries(report.categories)) {
        const categoryName = {
            html: 'HTML Estructura',
            assets: 'Assets y Enlaces',
            content: 'Contenido Personal',
            javascript: 'JavaScript'
        }[category];
        
        console.log(`  ${categoryName}: ${data.percentage}% (${data.score}/${data.maxScore}) - Peso: ${data.weight}%`);
    }
    
    if (report.recommendations.length > 0) {
        console.log('\\n💡 RECOMENDACIONES:');
        report.recommendations.forEach(rec => console.log(`  ${rec}`));
    }
    
    console.log('\\n' + '='.repeat(60));
    
    // Guardar reporte en archivo JSON
    try {
        fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
        console.log('💾 Reporte guardado en test-results.json');
    } catch (error) {
        console.error('❌ Error al guardar reporte:', error.message);
    }
    
    // Determinar código de salida para CI/CD
    const exitCode = report.finalGrade.percentage >= 70 ? 0 : 1;
    console.log(`\\n🔚 Finalizando con código: ${exitCode}`);
    
    process.exit(exitCode);
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
}

module.exports = runAllTests;