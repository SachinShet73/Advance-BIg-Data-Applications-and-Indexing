class KeyValueStore {
  constructor() {
    this.data = new Map();
    this.metadata = new Map();
  }

  set(key, value, etag = null) {
    const timestamp = new Date().toISOString();
    const version = this.metadata.has(key) ? this.metadata.get(key).version + 1 : 1;
    const newEtag = this.generateEtag(value, version);
    
    const meta = {
      createdAt: this.metadata.has(key) ? this.metadata.get(key).createdAt : timestamp,
      updatedAt: timestamp,
      version: version,
      etag: newEtag
    };

    this.data.set(key, { ...value, metadata: meta });
    this.metadata.set(key, meta);
    
    return { success: true, etag: newEtag, version: version };
  }

  get(key, ifNoneMatch = null) {
    if (!this.data.has(key)) {
      return { success: false, error: 'Not found' };
    }

    const data = this.data.get(key);
    const meta = this.metadata.get(key);

    if (ifNoneMatch && ifNoneMatch === meta.etag) {
      return { success: true, notModified: true, etag: meta.etag };
    }

    return { 
      success: true, 
      data: data, 
      etag: meta.etag,
      version: meta.version
    };
  }

  delete(key) {
    if (!this.data.has(key)) {
      return { success: false, error: 'Not found' };
    }

    this.data.delete(key);
    this.metadata.delete(key);
    return { success: true };
  }

  exists(key) {
    return this.data.has(key);
  }

  list() {
    const result = [];
    for (const [key, value] of this.data.entries()) {
      result.push({
        key: key,
        id: value.id,
        name: value.name,
        type: value.type,
        metadata: value.metadata
      });
    }
    return result;
  }

  generateEtag(value, version) {
    const content = JSON.stringify(value) + version.toString();
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

module.exports = KeyValueStore;