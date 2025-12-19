/**
 * GridApp - Google Apps Script Backend
 * API REST para conectar con Google Sheets y Google Drive
 *
 * CONFIGURACION:
 * 1. Crear nuevo proyecto en script.google.com
 * 2. Copiar este codigo
 * 3. Configurar los IDs abajo
 * 4. Desplegar como Web App
 */

// ============================================================================
// CONFIGURACION - MODIFICAR ESTOS VALORES
// ============================================================================

const CONFIG = {
  // ID de tu Google Sheet (extraido de la URL)
  SPREADSHEET_ID: '1UCRrS5N-g4fLuJ5wo_bwH_htKKmGt4271EKnKRJ5AI4',

  // ID de la carpeta de Google Drive para imagenes (extraido de la URL)
  DRIVE_FOLDER_ID: '15YZ1GFYpBrIKjGvS4JxtaCw-n_I2Ru3d',

  // Nombre de la hoja de configuracion
  CONFIG_SHEET_NAME: '_config',

  // Nombre de la hoja de carpetas
  FOLDERS_SHEET_NAME: '_folders',

  // Version de la API
  API_VERSION: '1.1.0'
};

// ============================================================================
// CORS Y RESPUESTAS HTTP
// ============================================================================

/**
 * Crea respuesta JSON con headers CORS
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Respuesta de exito
 */
function successResponse(data, message = 'OK') {
  return createJsonResponse({
    success: true,
    message: message,
    data: data,
    timestamp: new Date().toISOString(),
    version: CONFIG.API_VERSION
  });
}

/**
 * Respuesta de error
 */
function errorResponse(message, code = 400) {
  return createJsonResponse({
    success: false,
    error: {
      message: message,
      code: code
    },
    timestamp: new Date().toISOString(),
    version: CONFIG.API_VERSION
  });
}

// ============================================================================
// ENDPOINTS PRINCIPALES
// ============================================================================

/**
 * Handler para peticiones GET
 * @param {Object} e - Evento de la peticion
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'ping';

    switch (action) {
      case 'ping':
        return successResponse({ status: 'online' }, 'API is running');

      case 'getTopics':
        return getTopics();

      case 'getCards':
        const topicName = e.parameter.topic;
        if (!topicName) {
          return errorResponse('Parameter "topic" is required', 400);
        }
        return getCards(topicName);

      case 'getConfig':
        return getConfigData();

      case 'getTopicConfig':
        const configTopic = e.parameter.topic;
        if (!configTopic) {
          return errorResponse('Parameter "topic" is required', 400);
        }
        return getTopicConfig(configTopic);

      case 'getFolders':
        return getFolders();

      case 'searchInFolder':
        const searchFolderId = e.parameter.folderId;
        const searchQuery = e.parameter.query;
        if (!searchQuery) {
          return errorResponse('Parameter "query" is required', 400);
        }
        return searchInFolder(searchFolderId, searchQuery);

      default:
        return errorResponse('Unknown action: ' + action, 404);
    }
  } catch (error) {
    return errorResponse('Server error: ' + error.message, 500);
  }
}

/**
 * Handler para peticiones POST
 * @param {Object} e - Evento de la peticion
 */
function doPost(e) {
  try {
    let payload;

    // Parsear el body
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      return errorResponse('No data provided', 400);
    }

    const action = payload.action || e.parameter.action;

    switch (action) {
      case 'createTopic':
        return createTopic(payload);

      case 'deleteTopic':
        return deleteTopic(payload.topicName);

      case 'addCard':
        return addCard(payload);

      case 'updateCard':
        return updateCard(payload);

      case 'deleteCard':
        return deleteCard(payload);

      case 'uploadImage':
        return uploadImage(payload);

      case 'updateTopicConfig':
        return updateTopicConfig(payload);

      case 'syncData':
        return syncData(payload);

      case 'createFolder':
        return createFolder(payload);

      case 'deleteFolder':
        return deleteFolder(payload.folderId);

      case 'assignTopicToFolder':
        return assignTopicToFolder(payload);

      case 'removeTopicFromFolder':
        return removeTopicFromFolder(payload.topicName);

      default:
        return errorResponse('Unknown action: ' + action, 404);
    }
  } catch (error) {
    return errorResponse('Server error: ' + error.message, 500);
  }
}

// ============================================================================
// FUNCIONES DE TEMAS (TOPICS)
// ============================================================================

/**
 * Obtener lista de todos los temas (hojas)
 */
function getTopics() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheets = ss.getSheets();

  const topics = [];

  sheets.forEach(sheet => {
    const name = sheet.getName();

    // Ignorar hojas de configuracion/sistema
    if (name.startsWith('_')) return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    // Obtener headers (primera fila)
    let headers = [];
    if (lastCol > 0) {
      headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    }

    // Obtener configuracion de columnas
    const columnConfig = getColumnConfigForTopic(name);

    topics.push({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      cardCount: Math.max(0, lastRow - 1), // Restar header
      columns: headers.map((h, index) => ({
        name: h,
        type: columnConfig[h] || 'text',
        order: index + 1
      })),
      lastModified: sheet.getLastUpdatedDate ? sheet.getLastUpdatedDate() : null
    });
  });

  return successResponse(topics, 'Topics retrieved successfully');
}

/**
 * Crear nuevo tema (nueva hoja)
 */
function createTopic(payload) {
  const { title, columns } = payload;

  if (!title || !columns || columns.length === 0) {
    return errorResponse('Title and columns are required', 400);
  }

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  // Verificar si ya existe
  const existing = ss.getSheetByName(title);
  if (existing) {
    return errorResponse('Topic already exists: ' + title, 409);
  }

  // Crear nueva hoja
  const newSheet = ss.insertSheet(title);

  // Agregar headers
  const headers = columns.map(c => c.name);
  newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Formatear headers
  const headerRange = newSheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4F46E5');
  headerRange.setFontColor('#FFFFFF');

  // Guardar configuracion de columnas
  saveColumnConfig(title, columns);

  // Ajustar ancho de columnas
  columns.forEach((col, index) => {
    newSheet.setColumnWidth(index + 1, col.type === 'image' ? 200 : 150);
  });

  return successResponse({
    id: title.toLowerCase().replace(/\s+/g, '-'),
    name: title,
    columns: columns
  }, 'Topic created successfully');
}

/**
 * Eliminar tema
 */
function deleteTopic(topicName) {
  if (!topicName) {
    return errorResponse('Topic name is required', 400);
  }

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(topicName);

  if (!sheet) {
    return errorResponse('Topic not found: ' + topicName, 404);
  }

  // No permitir eliminar si es la unica hoja
  if (ss.getSheets().length <= 1) {
    return errorResponse('Cannot delete the only sheet', 400);
  }

  ss.deleteSheet(sheet);

  // Eliminar configuracion
  deleteColumnConfig(topicName);

  return successResponse({ deleted: topicName }, 'Topic deleted successfully');
}

// ============================================================================
// FUNCIONES DE TARJETAS (CARDS)
// ============================================================================

/**
 * Obtener todas las tarjetas de un tema
 */
function getCards(topicName) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(topicName);

  if (!sheet) {
    return errorResponse('Topic not found: ' + topicName, 404);
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow < 1 || lastCol < 1) {
    return successResponse({
      topic: topicName,
      headers: [],
      cards: []
    }, 'Empty topic');
  }

  // Obtener headers
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Obtener datos (desde fila 2)
  let cards = [];
  if (lastRow > 1) {
    const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    cards = data.map((row, rowIndex) => {
      const cells = {};
      headers.forEach((header, colIndex) => {
        cells[header] = row[colIndex];
      });
      return {
        id: rowIndex + 2, // Fila real en la hoja
        rowIndex: rowIndex,
        cells: cells
      };
    });
  }

  // Obtener configuracion de tipos
  const columnConfig = getColumnConfigForTopic(topicName);

  return successResponse({
    topic: topicName,
    headers: headers.map((h, i) => ({
      name: h,
      type: columnConfig[h] || 'text',
      order: i + 1
    })),
    cards: cards,
    totalCards: cards.length
  }, 'Cards retrieved successfully');
}

/**
 * Agregar nueva tarjeta
 */
function addCard(payload) {
  const { topicName, cells } = payload;

  if (!topicName || !cells) {
    return errorResponse('Topic name and cells are required', 400);
  }

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(topicName);

  if (!sheet) {
    return errorResponse('Topic not found: ' + topicName, 404);
  }

  // Obtener headers para ordenar los valores
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Crear fila con valores en orden correcto
  const rowValues = headers.map(header => cells[header] || '');

  // Agregar al final
  sheet.appendRow(rowValues);

  const newRowIndex = sheet.getLastRow();

  return successResponse({
    id: newRowIndex,
    topicName: topicName,
    cells: cells
  }, 'Card added successfully');
}

/**
 * Actualizar tarjeta existente
 */
function updateCard(payload) {
  const { topicName, rowId, cells } = payload;

  if (!topicName || !rowId || !cells) {
    return errorResponse('Topic name, row ID and cells are required', 400);
  }

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(topicName);

  if (!sheet) {
    return errorResponse('Topic not found: ' + topicName, 404);
  }

  // Obtener headers
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Crear fila con valores
  const rowValues = headers.map(header => cells[header] || '');

  // Actualizar fila
  sheet.getRange(rowId, 1, 1, rowValues.length).setValues([rowValues]);

  return successResponse({
    id: rowId,
    topicName: topicName,
    cells: cells
  }, 'Card updated successfully');
}

/**
 * Eliminar tarjeta
 */
function deleteCard(payload) {
  const { topicName, rowId } = payload;

  if (!topicName || !rowId) {
    return errorResponse('Topic name and row ID are required', 400);
  }

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(topicName);

  if (!sheet) {
    return errorResponse('Topic not found: ' + topicName, 404);
  }

  // Eliminar fila
  sheet.deleteRow(rowId);

  return successResponse({
    deleted: rowId,
    topicName: topicName
  }, 'Card deleted successfully');
}

// ============================================================================
// FUNCIONES DE CONFIGURACION
// ============================================================================

/**
 * Asegurar que existe la hoja de configuracion
 */
function ensureConfigSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let configSheet = ss.getSheetByName(CONFIG.CONFIG_SHEET_NAME);

  if (!configSheet) {
    configSheet = ss.insertSheet(CONFIG.CONFIG_SHEET_NAME);

    // Agregar headers
    configSheet.getRange(1, 1, 1, 4).setValues([
      ['topic_id', 'column_name', 'column_type', 'column_order']
    ]);

    // Formatear
    const headerRange = configSheet.getRange(1, 1, 1, 4);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#374151');
    headerRange.setFontColor('#FFFFFF');

    // Ocultar la hoja (opcional)
    // configSheet.hideSheet();
  }

  return configSheet;
}

/**
 * Guardar configuracion de columnas de un tema
 */
function saveColumnConfig(topicName, columns) {
  const configSheet = ensureConfigSheet();
  const topicId = topicName.toLowerCase().replace(/\s+/g, '-');

  // Eliminar configuracion anterior
  deleteColumnConfig(topicName);

  // Agregar nueva configuracion
  const rows = columns.map((col, index) => [
    topicId,
    col.name,
    col.type || 'text',
    index + 1
  ]);

  if (rows.length > 0) {
    const lastRow = configSheet.getLastRow();
    configSheet.getRange(lastRow + 1, 1, rows.length, 4).setValues(rows);
  }
}

/**
 * Eliminar configuracion de un tema
 */
function deleteColumnConfig(topicName) {
  const configSheet = ensureConfigSheet();
  const topicId = topicName.toLowerCase().replace(/\s+/g, '-');

  const lastRow = configSheet.getLastRow();
  if (lastRow <= 1) return;

  const data = configSheet.getRange(2, 1, lastRow - 1, 1).getValues();

  // Encontrar filas a eliminar (de abajo hacia arriba)
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][0] === topicId) {
      configSheet.deleteRow(i + 2);
    }
  }
}

/**
 * Obtener configuracion de columnas de un tema
 */
function getColumnConfigForTopic(topicName) {
  const configSheet = ensureConfigSheet();
  const topicId = topicName.toLowerCase().replace(/\s+/g, '-');

  const lastRow = configSheet.getLastRow();
  if (lastRow <= 1) return {};

  const data = configSheet.getRange(2, 1, lastRow - 1, 4).getValues();

  const config = {};
  data.forEach(row => {
    if (row[0] === topicId) {
      config[row[1]] = row[2]; // column_name -> column_type
    }
  });

  return config;
}

/**
 * Obtener toda la configuracion
 */
function getConfigData() {
  const configSheet = ensureConfigSheet();

  const lastRow = configSheet.getLastRow();
  if (lastRow <= 1) {
    return successResponse([], 'No configuration found');
  }

  const data = configSheet.getRange(2, 1, lastRow - 1, 4).getValues();

  const config = data.map(row => ({
    topicId: row[0],
    columnName: row[1],
    columnType: row[2],
    columnOrder: row[3]
  }));

  return successResponse(config, 'Configuration retrieved');
}

/**
 * Obtener configuracion de un tema especifico
 */
function getTopicConfig(topicName) {
  const config = getColumnConfigForTopic(topicName);
  return successResponse(config, 'Topic configuration retrieved');
}

// ============================================================================
// FUNCIONES DE IMAGENES (GOOGLE DRIVE)
// ============================================================================

/**
 * Subir imagen a Google Drive
 */
function uploadImage(payload) {
  const { imageData, fileName, mimeType } = payload;

  if (!imageData || !fileName) {
    return errorResponse('Image data and file name are required', 400);
  }

  try {
    // Obtener carpeta de destino
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);

    // Decodificar Base64
    const decodedData = Utilities.base64Decode(imageData);
    const blob = Utilities.newBlob(decodedData, mimeType || 'image/png', fileName);

    // Crear archivo
    const file = folder.createFile(blob);

    // Hacer el archivo publico
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Obtener URL directa de la imagen
    const fileId = file.getId();
    const directUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;

    return successResponse({
      fileId: fileId,
      fileName: fileName,
      url: directUrl,
      webViewLink: file.getUrl(),
      size: file.getSize()
    }, 'Image uploaded successfully');

  } catch (error) {
    return errorResponse('Failed to upload image: ' + error.message, 500);
  }
}

/**
 * Eliminar imagen de Google Drive
 */
function deleteImage(fileId) {
  if (!fileId) {
    return errorResponse('File ID is required', 400);
  }

  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);

    return successResponse({ deleted: fileId }, 'Image deleted successfully');
  } catch (error) {
    return errorResponse('Failed to delete image: ' + error.message, 500);
  }
}

// ============================================================================
// FUNCIONES DE SINCRONIZACION
// ============================================================================

/**
 * Sincronizar datos completos
 */
function syncData(payload) {
  const { topics } = payload;

  if (!topics || !Array.isArray(topics)) {
    return errorResponse('Topics array is required', 400);
  }

  const results = [];

  topics.forEach(topic => {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      let sheet = ss.getSheetByName(topic.name);

      // Crear hoja si no existe
      if (!sheet) {
        sheet = ss.insertSheet(topic.name);

        // Agregar headers
        const headers = topic.columns.map(c => c.name);
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

        // Guardar config
        saveColumnConfig(topic.name, topic.columns);
      }

      // Sincronizar cards
      if (topic.cards && topic.cards.length > 0) {
        const headers = topic.columns.map(c => c.name);

        topic.cards.forEach((card, index) => {
          const rowValues = headers.map(h => card.cells[h] || '');
          const rowNum = index + 2;

          if (rowNum <= sheet.getLastRow()) {
            sheet.getRange(rowNum, 1, 1, rowValues.length).setValues([rowValues]);
          } else {
            sheet.appendRow(rowValues);
          }
        });
      }

      results.push({ topic: topic.name, status: 'synced' });

    } catch (error) {
      results.push({ topic: topic.name, status: 'error', error: error.message });
    }
  });

  return successResponse(results, 'Sync completed');
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Obtener informacion del spreadsheet
 */
function getSpreadsheetInfo() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  return successResponse({
    name: ss.getName(),
    url: ss.getUrl(),
    sheets: ss.getSheets().map(s => s.getName()),
    timezone: ss.getSpreadsheetTimeZone()
  }, 'Spreadsheet info retrieved');
}

/**
 * Test de conexion
 */
function testConnection() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);

    return successResponse({
      spreadsheet: {
        connected: true,
        name: ss.getName()
      },
      drive: {
        connected: true,
        folderName: folder.getName()
      }
    }, 'Connection successful');

  } catch (error) {
    return errorResponse('Connection failed: ' + error.message, 500);
  }
}

// ============================================================================
// FUNCIONES DE CARPETAS (FOLDERS)
// ============================================================================

/**
 * Asegurar que existe la hoja de carpetas
 */
function ensureFoldersSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let foldersSheet = ss.getSheetByName(CONFIG.FOLDERS_SHEET_NAME);

  if (!foldersSheet) {
    foldersSheet = ss.insertSheet(CONFIG.FOLDERS_SHEET_NAME);

    // Agregar headers
    foldersSheet.getRange(1, 1, 1, 3).setValues([
      ['folder_id', 'folder_name', 'topic_name']
    ]);

    // Formatear
    const headerRange = foldersSheet.getRange(1, 1, 1, 3);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#7C3AED');
    headerRange.setFontColor('#FFFFFF');
  }

  return foldersSheet;
}

/**
 * Obtener todas las carpetas con sus temas
 */
function getFolders() {
  const foldersSheet = ensureFoldersSheet();
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  const lastRow = foldersSheet.getLastRow();

  // Estructura para carpetas
  const foldersMap = {};

  // Leer asignaciones de carpetas
  if (lastRow > 1) {
    const data = foldersSheet.getRange(2, 1, lastRow - 1, 3).getValues();

    data.forEach(row => {
      const folderId = row[0];
      const folderName = row[1];
      const topicName = row[2];

      if (!foldersMap[folderId]) {
        foldersMap[folderId] = {
          id: folderId,
          name: folderName,
          topics: []
        };
      }

      foldersMap[folderId].topics.push(topicName);
    });
  }

  // Obtener todos los temas para contar cards
  const sheets = ss.getSheets();
  const topicCards = {};

  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name.startsWith('_')) return;
    topicCards[name] = Math.max(0, sheet.getLastRow() - 1);
  });

  // Construir respuesta de carpetas
  const folders = Object.values(foldersMap).map(folder => ({
    id: folder.id,
    name: folder.name,
    topicCount: folder.topics.length,
    topics: folder.topics.map(topicName => ({
      name: topicName,
      cardCount: topicCards[topicName] || 0
    }))
  }));

  // Obtener temas sin carpeta
  const assignedTopics = new Set();
  Object.values(foldersMap).forEach(folder => {
    folder.topics.forEach(t => assignedTopics.add(t));
  });

  const uncategorizedTopics = [];
  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name.startsWith('_')) return;
    if (!assignedTopics.has(name)) {
      uncategorizedTopics.push({
        name: name,
        cardCount: topicCards[name] || 0
      });
    }
  });

  return successResponse({
    folders: folders,
    uncategorized: uncategorizedTopics
  }, 'Folders retrieved successfully');
}

/**
 * Crear nueva carpeta
 */
function createFolder(payload) {
  const { folderName } = payload;

  if (!folderName) {
    return errorResponse('Folder name is required', 400);
  }

  const foldersSheet = ensureFoldersSheet();

  // Generar ID unico
  const folderId = folderName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 20);

  // Verificar si ya existe
  const lastRow = foldersSheet.getLastRow();
  if (lastRow > 1) {
    const existingIds = foldersSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < existingIds.length; i++) {
      if (existingIds[i][0] === folderId) {
        return errorResponse('Folder already exists', 409);
      }
    }
  }

  // Crear entrada placeholder (carpeta vacia)
  // La carpeta se crea realmente cuando se le asigna un tema

  return successResponse({
    id: folderId,
    name: folderName,
    topicCount: 0,
    topics: []
  }, 'Folder created successfully');
}

/**
 * Eliminar carpeta (los temas pasan a sin categoria)
 */
function deleteFolder(folderId) {
  if (!folderId) {
    return errorResponse('Folder ID is required', 400);
  }

  const foldersSheet = ensureFoldersSheet();
  const lastRow = foldersSheet.getLastRow();

  if (lastRow <= 1) {
    return errorResponse('Folder not found', 404);
  }

  // Eliminar todas las filas de esta carpeta (de abajo hacia arriba)
  const data = foldersSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let deleted = 0;

  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][0] === folderId) {
      foldersSheet.deleteRow(i + 2);
      deleted++;
    }
  }

  if (deleted === 0) {
    return errorResponse('Folder not found', 404);
  }

  return successResponse({
    deleted: folderId,
    topicsRemoved: deleted
  }, 'Folder deleted successfully');
}

/**
 * Asignar tema a carpeta
 */
function assignTopicToFolder(payload) {
  const { topicName, folderId, folderName } = payload;

  if (!topicName || !folderId || !folderName) {
    return errorResponse('Topic name, folder ID and folder name are required', 400);
  }

  // Verificar que el tema existe
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(topicName);

  if (!sheet) {
    return errorResponse('Topic not found: ' + topicName, 404);
  }

  const foldersSheet = ensureFoldersSheet();

  // Primero eliminar cualquier asignacion existente de este tema
  removeTopicFromFolderInternal(topicName);

  // Agregar nueva asignacion
  foldersSheet.appendRow([folderId, folderName, topicName]);

  return successResponse({
    topicName: topicName,
    folderId: folderId,
    folderName: folderName
  }, 'Topic assigned to folder successfully');
}

/**
 * Remover tema de su carpeta (interno)
 */
function removeTopicFromFolderInternal(topicName) {
  const foldersSheet = ensureFoldersSheet();
  const lastRow = foldersSheet.getLastRow();

  if (lastRow <= 1) return;

  const data = foldersSheet.getRange(2, 1, lastRow - 1, 3).getValues();

  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][2] === topicName) {
      foldersSheet.deleteRow(i + 2);
    }
  }
}

/**
 * Remover tema de carpeta (endpoint)
 */
function removeTopicFromFolder(topicName) {
  if (!topicName) {
    return errorResponse('Topic name is required', 400);
  }

  removeTopicFromFolderInternal(topicName);

  return successResponse({
    topicName: topicName
  }, 'Topic removed from folder successfully');
}

/**
 * Buscar en primera columna de todos los temas de una carpeta
 */
function searchInFolder(folderId, query) {
  if (!query || query.length < 2) {
    return errorResponse('Query must be at least 2 characters', 400);
  }

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const foldersSheet = ensureFoldersSheet();
  const searchLower = query.toLowerCase();

  // Obtener temas de la carpeta (o todos si no hay folderId)
  let topicsToSearch = [];

  if (folderId) {
    const lastRow = foldersSheet.getLastRow();
    if (lastRow > 1) {
      const data = foldersSheet.getRange(2, 1, lastRow - 1, 3).getValues();
      data.forEach(row => {
        if (row[0] === folderId) {
          topicsToSearch.push(row[2]); // topic_name
        }
      });
    }
  } else {
    // Buscar en todos los temas sin carpeta
    const sheets = ss.getSheets();
    const assignedTopics = new Set();

    const lastRow = foldersSheet.getLastRow();
    if (lastRow > 1) {
      const data = foldersSheet.getRange(2, 1, lastRow - 1, 3).getValues();
      data.forEach(row => assignedTopics.add(row[2]));
    }

    sheets.forEach(sheet => {
      const name = sheet.getName();
      if (!name.startsWith('_') && !assignedTopics.has(name)) {
        topicsToSearch.push(name);
      }
    });
  }

  // Buscar en cada tema
  const results = [];

  topicsToSearch.forEach(topicName => {
    const sheet = ss.getSheetByName(topicName);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow < 2 || lastCol < 1) return;

    // Obtener solo primera columna (indice)
    const firstColData = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    const header = sheet.getRange(1, 1).getValue();

    firstColData.forEach((row, index) => {
      const cellValue = String(row[0]).toLowerCase();
      if (cellValue.includes(searchLower)) {
        results.push({
          topicName: topicName,
          cardId: index + 2, // Fila real
          cardIndex: index,
          columnName: header,
          value: row[0],
          matchIndex: cellValue.indexOf(searchLower)
        });
      }
    });
  });

  // Ordenar por relevancia (posicion del match)
  results.sort((a, b) => a.matchIndex - b.matchIndex);

  return successResponse({
    query: query,
    folderId: folderId,
    totalResults: results.length,
    results: results.slice(0, 50) // Limitar a 50 resultados
  }, 'Search completed');
}
