var AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: 'AKIAIO7XUEE3QS732JBQ',
    secretAccessKey: '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',
    region_name: 'us-east-1'
});
AWS.config.region = 'us-east-1';

var db = new AWS.DynamoDB();

db.listTables(function(err, data) {
      console.log(data.TableNames);
});
