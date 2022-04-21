const os = require("os")
const globalConfig = require('./config');

const levels = {
  debug: -1,
  trace: 0,
  info: 1,
  warning: 2,
  error: 3
}

function startDoc(){
  return  {
    Level: 'trace',
    Component: globalConfig.Component,
    Env: globalConfig.Env || "development",
    Request: {},
    "@timestamp": new Date().toISOString(),
  }
} 

function logDoc(doc){
  if(levels[globalConfig.LogLevel.toLowerCase()] > levels[doc.Level.toLowerCase()]){
    return;
  }
  console.log(JSON.stringify(doc));
  return;
}

function logMessage (message, level, data, isError) {
    var doc = startDoc();
    doc.Level = level || doc.Level;
    doc.Message = message;
    if(isError && data){
      doc.Error = {message: data.message, stack: data.stack};
    }else{
      doc.Data = data;
    }
    logDoc(doc);
}

exports.error = (message, error) => logMessage(message, 'error', error, true);
exports.info = (message, data) => logMessage(message, 'info', data);
exports.warning = (message, data) => logMessage(message, 'warning', data);
exports.trace = (message, data) => logMessage(message, 'trace', data);
exports.debug = (message, data) => logMessage(message, 'debug', data);
exports.requestHandler = (req, res, next) => {
  const { end } = res
  const start = Date.now()
  
  const doc = startDoc();

  res.end = function (...args) {
    res.end = end
    end.apply(res, args)

    if (req.skipLog) {
      return
    }

    doc.Response = {}
    doc.Duration = Date.now() - start

    if (req.route && req.route.path) {
      doc.Request.route = {
        path: req.route.path,
      }
    }

    if (res.error) {
      doc.Error = res.error
    }

    logDoc(doc);
  }
  next()
}

exports.errorHandler = function (err, req, res, next) {
  res.error = err
  next(err)
}

exports.skipLog = function (req, res, next) {
  req.skipLog = true
  next()
}
