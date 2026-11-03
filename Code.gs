
const CLAVE = "cambiar-esta-clave";

const CAMPOS = ["p1","p2","p3","p4","p5","p6","p7","p8","p9","p10","p11","p12","p13","p14","p15","p16","p17","p18"];

function hoja_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(["fecha"].concat(CAMPOS));
  return sh;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const fila = [new Date()].concat(CAMPOS.map(function (k) {
      const v = d[k];
      return Array.isArray(v) ? v.join("; ") : String(v == null ? "" : v).slice(0, 2000);
    }));
    hoja_().appendRow(fila);
    return ContentService.createTextOutput("ok");
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if (!e.parameter || e.parameter.clave !== CLAVE) {
    return json_({ error: "Clave incorrecta" });
  }
  const valores = hoja_().getDataRange().getValues();
  const encabezado = valores.shift();
  const filas = valores.map(function (f) {
    const o = {};
    encabezado.forEach(function (h, i) { o[h] = f[i] instanceof Date ? f[i].toISOString() : f[i]; });
    return o;
  });
  return json_({ filas: filas });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
