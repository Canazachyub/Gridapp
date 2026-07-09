import type { Topic, Card, ColumnConfig } from '../types';

// ============================================================================
// TEMA DEMO: PATOLOGÍA CUTÁNEA
// ============================================================================

const demoColumns: ColumnConfig[] = [
  { id: 'col-patologia', name: 'Patología', type: 'text', order: 1 },
  { id: 'col-pregunta', name: 'Pregunta', type: 'text', order: 2 },
  { id: 'col-respuesta', name: 'Respuesta', type: 'text', order: 3 },
  { id: 'col-palabra-clave', name: 'Palabra Clave', type: 'text', order: 4 },
  { id: 'col-nemotecnia', name: 'Nemotecnia', type: 'text', order: 5 },
  { id: 'col-imagen', name: 'Imagen', type: 'image', order: 6 }
];

const demoCards: Card[] = [
  {
    id: 1,
    rowIndex: 2,
    cells: {
      'Patología': 'DERMATITIS ESPONGIÓTICA (ECCEMA)',
      'Pregunta': '¿Cuál es el hallazgo histopatológico característico que consiste en edema intercelular epidérmico?',
      'Respuesta': 'Espongiosis: edema entre queratinocitos que los separa, dando aspecto de esponja. En fase aguda forma vesículas intraepidérmicas.',
      'Palabra Clave': 'ESPONGIOSIS',
      'Nemotecnia': '"EsPONGeosis" → la epidermis se hincha como una esponja llena de agua. Visual: esponja amarilla entre células de la piel.',
      'Imagen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Acute_eczema_-_spongiosis_-_very_high_mag.jpg/640px-Acute_eczema_-_spongiosis_-_very_high_mag.jpg'
    }
  },
  {
    id: 2,
    rowIndex: 3,
    cells: {
      'Patología': 'PSORIASIS VULGAR',
      'Pregunta': '¿Cuáles son las 3 hallazgas clínicas clásicas de la psoriasis en placa?',
      'Respuesta': '• Eritema de base\n• Placas bien delimitadas\n• Escamas blanquecinas plateadas\n• Signo de la película de estearina\n• Signo de la lámpara de Petróleo',
      'Palabra Clave': 'PARAKERATOSIS',
      'Nemotecnia': '"PSO-RIASIS = PLATA ROJA" → placas ROJAS con escamas PLATEADAS. Visual: una moneda de plata sobre piel roja.',
      'Imagen': ''
    }
  },
  {
    id: 3,
    rowIndex: 4,
    cells: {
      'Patología': 'ACNE VULGAR',
      'Pregunta': '¿Cuáles son los 4 factores fisiopatológicos principales del acné?',
      'Respuesta': '• Hiperqueratinización del folículo pilosebáceo\n• Aumento de secreción sebácea\n• Colonización por Cutibacterium acnes\n• Inflamación',
      'Palabra Clave': 'SEBORREA',
      'Nemotecnia': '"4F del ACNÉ" → Folículo tapado, Fango sebáceo, Flora (C. acnes), Fuego inflamatorio.',
      'Imagen': ''
    }
  }
];

export const demoTopic: Topic = {
  id: 'demo-patologia-cutanea',
  name: 'PATOLOGÍA CUTÁNEA (DEMO)',
  cardCount: demoCards.length,
  columns: demoColumns,
  cards: demoCards,
  lastModified: new Date().toISOString()
};

export default demoTopic;
