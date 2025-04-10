const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');
const validator = require('./validator');

class Uploader {
  constructor() {
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    this.fileFilter = (req, file, cb) => {
      const startTime = Date.now();
      try {
        const isValid = validator.validateImageFile(file);
        
        logger.info('파일 필터링', {
          timestamp: new Date().toISOString(),
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          isValid,
          processingTime: `${Date.now() - startTime}ms`
        });

        if (isValid) {
          cb(null, true);
        } else {
          cb(new Error('허용되지 않는 파일 형식입니다.'), false);
        }
      } catch (error) {
        logger.error('파일 필터링 실패', {
          timestamp: new Date().toISOString(),
          originalName: file.originalname,
          error: error.message,
          processingTime: `${Date.now() - startTime}ms`
        });
        cb(error, false);
      }
    };

    this.upload = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
      }
    });

    logger.info('Uploader 초기화', {
      timestamp: new Date().toISOString(),
      uploadDir: path.join(__dirname, '../uploads')
    });
  }

  single(fieldname) {
    return (req, res, next) => {
      const startTime = Date.now();
      this.upload.single(fieldname)(req, res, (err) => {
        if (err) {
          logger.error('파일 업로드 실패', {
            timestamp: new Date().toISOString(),
            fieldname,
            error: err.message,
            processingTime: `${Date.now() - startTime}ms`
          });
          return res.status(400).json({ error: err.message });
        }

        if (req.file) {
          logger.info('파일 업로드 성공', {
            timestamp: new Date().toISOString(),
            fieldname,
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            processingTime: `${Date.now() - startTime}ms`
          });
        }

        next();
      });
    };
  }

  array(fieldname, maxCount) {
    return (req, res, next) => {
      const startTime = Date.now();
      this.upload.array(fieldname, maxCount)(req, res, (err) => {
        if (err) {
          logger.error('다중 파일 업로드 실패', {
            timestamp: new Date().toISOString(),
            fieldname,
            maxCount,
            error: err.message,
            processingTime: `${Date.now() - startTime}ms`
          });
          return res.status(400).json({ error: err.message });
        }

        if (req.files && req.files.length > 0) {
          logger.info('다중 파일 업로드 성공', {
            timestamp: new Date().toISOString(),
            fieldname,
            fileCount: req.files.length,
            files: req.files.map(file => ({
              filename: file.filename,
              originalName: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              path: file.path
            })),
            processingTime: `${Date.now() - startTime}ms`
          });
        }

        next();
      });
    };
  }

  fields(fields) {
    return (req, res, next) => {
      const startTime = Date.now();
      this.upload.fields(fields)(req, res, (err) => {
        if (err) {
          logger.error('다중 필드 파일 업로드 실패', {
            timestamp: new Date().toISOString(),
            fields,
            error: err.message,
            processingTime: `${Date.now() - startTime}ms`
          });
          return res.status(400).json({ error: err.message });
        }

        if (req.files) {
          logger.info('다중 필드 파일 업로드 성공', {
            timestamp: new Date().toISOString(),
            fields,
            files: Object.entries(req.files).map(([field, files]) => ({
              field,
              count: files.length,
              files: files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path
              }))
            })),
            processingTime: `${Date.now() - startTime}ms`
          });
        }

        next();
      });
    };
  }
}

module.exports = new Uploader(); 