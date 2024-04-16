import * as mysql from 'mysql';
import * as AWS from 'aws-sdk';

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT
});

const s3 = new AWS.S3();
const cloudwatchlogs = new AWS.CloudWatchLogs();

export const handler = async (event, context) => {
	console.log('event', event);
	const employeeId = event.pathParameters?.id;
	const sql = `SELECT * FROM employee ${employeeId ? 'WHERE id = ?' : ''}`;
	console.log('sql', sql);

	const logData = {
		httpMethod: event.httpMethod,
		path: event.path
	  };
	
	  await cloudwatchlogs.putLogEvents({
		logGroupName: process.env.CLOUDWATCH_LOG_GROUP_NAME,
		logStreamName: context.awsRequestId,
		logEvents: [{
		  message: JSON.stringify(logData),
		  timestamp: Date.now(),
		}]
	  }).promise();
	
	  const params = {
		Bucket: process.env.S3_LOG_BUCKET,
		Key: `${context.awsRequestId}.log`,
		Body: JSON.stringify(logData),
	  };
	
	  await s3.putObject(params).promise();

	try {
		const employeeList = employeeId ? await new Promise((resolve, reject) => {
			pool.query(sql, employeeId ? [employeeId] : [], (err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			});
		})	: await new Promise((resolve, reject) => {
			pool.query(sql, [], (err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			});
		});

		return {
			statusCode: 200,
			body: JSON.stringify(employeeList),
		};
	} catch (error) {
		console.log('error', error);
		return {
			statusCode: 500,
			body: JSON.stringify({ message: 'Internal server error occurred!' }),
		};
	} finally {
	}
};
