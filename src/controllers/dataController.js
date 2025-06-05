const KeyValueStore = require('../storage/keyValueStore');

class DataController {
  constructor() {
    this.store = new KeyValueStore();
  }

  createData = (req, res) => {
    try {
      const { id } = req.body;
      
      if (this.store.exists(id)) {
        return res.status(409).json({
          error: 'Conflict',
          message: `Resource with id '${id}' already exists`,
          timestamp: new Date().toISOString()
        });
      }

      const result = this.store.set(id, req.body);
      
      if (result.success) {
        res.status(201)
           .header('ETag', `"${result.etag}"`)
           .header('Location', `/api/v1/data/${id}`)
           .json({
             message: 'Resource created successfully',
             id: id,
             version: result.version,
             timestamp: new Date().toISOString()
           });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to create resource',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  getData = (req, res) => {
    try {
      const { id } = req.params;
      const ifNoneMatch = req.headers['if-none-match'];
      
      const result = this.store.get(id, ifNoneMatch ? ifNoneMatch.replace(/"/g, '') : null);
      
      if (!result.success) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Resource with id '${id}' not found`,
          timestamp: new Date().toISOString()
        });
      }

      if (result.notModified) {
        return res.status(304)
                 .header('ETag', `"${result.etag}"`)
                 .end();
      }

      res.status(200)
         .header('ETag', `"${result.etag}"`)
         .header('Cache-Control', 'max-age=3600')
         .json(result.data);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  deleteData = (req, res) => {
    try {
      const { id } = req.params;
      
      const result = this.store.delete(id);
      
      if (!result.success) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Resource with id '${id}' not found`,
          timestamp: new Date().toISOString()
        });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  listData = (req, res) => {
    try {
      const data = this.store.list();
      
      res.status(200)
         .header('Cache-Control', 'max-age=300')
         .json({
           data: data,
           count: data.length,
           timestamp: new Date().toISOString()
         });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
}

module.exports = DataController;