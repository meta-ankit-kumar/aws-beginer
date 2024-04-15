import * as mysql from 'mysql';

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: 3306
});

export const handler = async (event) => {
	// Parse request body (assuming JSON format)
	console.log('event.body', event);
	const data = event.body;
	console.log('process.env.DB_HOST', process.env.DB_HOST)
	console.log('data', data);
	// Prepare SQL statement using parameterized queries for security
	const sql = 'INSERT INTO employee (firstName, lastName) VALUES ?';
	const values = data.map((employee) => [employee.firstName, employee.lastName]);

	try {
		// Connect to database pool and execute query
		await new Promise((resolve, reject) => {
			pool.query(sql, [values], (err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			});
		});

		return {
			statusCode: 200,
			body: JSON.stringify({ message: 'Records inserted successfully!' }),
		};
	} catch (error) {
		console.error('Hello in the catch', error);
		return {
			statusCode: 500,
			body: JSON.stringify({ message: 'Internal server error occurred!' }),
		};
	} finally {
		// Close connection pool (optional, handled automatically by some libraries)
		// pool.end();
	}
};
