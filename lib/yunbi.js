'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

module.exports = class JubiNews extends EventEmitter {
  constructor(crawler) {
    super();
    this._preUrl = 'https://yunbi.zendesk.com';
    this._crawler = crawler;
  }

  async start(current) {
    this._crawler.queue([
      {
        uri:
          this._preUrl +
          '/hc/api/internal/recent_activities?locale=zh-cn&page=1&locale=zh-cn',
        callback: async (err, res, done) => {
          if (err) {
            this.emit('error', err);
          }

          const $ = res.$;
          const notices = [];
          const body = JSON.parse(res.body);
          const activities = _.get(body, 'activities');

          if (activities && activities.length) {
            _.each(activities, activity => {
              const timestamp = +new Date(activity.timestamp);

              if (timestamp > current) {
                notices.push({
                  title: activity.title,
                  time: activity.timestamp,
                  url: this._preUrl + activity.url
                });
              }
            });
          }

          this.emit('data', notices);

          done();
        }
      }
    ]);
  }
};