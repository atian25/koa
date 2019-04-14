
'use strict';

const assert = require('assert');
const request = require('../helpers/context').request;

describe('req.protocol', () => {
  describe('when encrypted', () => {
    it('should return "https"', () => {
      const req = request();
      req.req.socket = { encrypted: true };
      assert.equal(req.protocol, 'https');
    });
  });

  describe('when unencrypted', () => {
    it('should return "http"', () => {
      const req = request();
      req.req.socket = {};
      assert.equal(req.protocol, 'http');
    });
  });

  describe('when X-Forwarded-Proto is present', () => {
    describe('and proxy is trusted', () => {
      it('should be used', () => {
        const req = request();
        req.app.proxy = true;
        req.req.socket = {};
        req.header['x-forwarded-proto'] = 'https, http';
        assert.equal(req.protocol, 'https');
      });

      describe('and X-Forwarded-Proto is empty', () => {
        it('should return "http"', () => {
          const req = request();
          req.app.proxy = true;
          req.req.socket = {};
          req.header['x-forwarded-proto'] = '';
          assert.equal(req.protocol, 'http');
        });
      });
    });

    describe('and proxy is not trusted', () => {
      it('should not be used', () => {
        const req = request();
        req.req.socket = {};
        req.header['x-forwarded-proto'] = 'https, http';
        assert.equal(req.protocol, 'http');
      });
    });
  });

  describe('when Forwarded is present', () => {
    describe('and proxy is trusted', () => {
      it('should be used', () => {
        const req = request();
        req.app.proxy = true;
        req.req.socket = {};
        req.header['forwarded'] = 'for=127.0.0.1;proto=https,proto=http';
        req.header['x-forwarded-proto'] = 'http, https';
        assert.equal(req.protocol, 'https');
      });

      it('should use x-forwarded as default', () => {
        const req = request();
        req.app.proxy = true;
        req.req.socket = {};
        req.header['forwarded'] = 'for=127.0.0.1';
        req.header['x-forwarded-proto'] = 'https, http';
        assert.equal(req.protocol, 'https');
      });
    });

    describe('and proxy is not trusted', () => {
      it('should not be used', () => {
        const req = request();
        req.req.socket = {};
        req.header['forwarded'] = 'for=127.0.0.1;proto=https,proto=http';
        req.header['x-forwarded-proto'] = 'https, http';
        assert.equal(req.protocol, 'http');
      });
    });
  });
});
