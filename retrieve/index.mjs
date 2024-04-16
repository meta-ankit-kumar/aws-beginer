import * as mysql from 'mysql';

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT
});

export const handler = async (event) => {
	console.log('event', event);
	const employeeId = event.pathParameters?.id;
	const sql = `SELECT * FROM employee ${employeeId ? 'WHERE id = ?' : ''}`;
	console.log('sql', sql);

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
