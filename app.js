require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const bunyanMiddleware = require('bunyan-middleware');
const bearerToken = require('express-bearer-token');
const logUtils = require('./src/utils/LogsUtils');

const usersRouter = require('./src/routes/users');
const healthRouter = require('./src/routes/health');

const tokenGenerator = require('./src/model/TokenGenerator');
const csController = require('./src/controller/CsController');

csController.init(tokenGenerator);

const app = express();

if (process.env.DEBUG === 'true') {
    logUtils.createTestLogger();
} else {
    logUtils.createNewLogger();
}

app.use(bunyanMiddleware(
    {
        logger: logUtils.log,
        requestStart: true,
        additionalRequestFinishData: (req, res) => {
            return {
                req_url: req.baseUrl + req.url,
                req_method: req.method,
                req_body: req.body,
                res_body: res.body,
            };
        },
    }
));

app.use(bearerToken());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', usersRouter);
app.use('/health', healthRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handlers
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    logUtils.log.error(err, 'error handler');
    res.json(err);
});

module.exports = app;
