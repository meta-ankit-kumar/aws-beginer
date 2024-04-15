import * as mysql from 'mysql';

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: 3306
});

export const handler = async (event) => {
	const data = event.body;
	const sql = 'INSERT INTO employee (firstName, lastName) VALUES ?';
	const values = data.map((employee) => [employee.firstName, employee.lastName]);

	try {
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
		return {
			statusCode: 500,
			body: JSON.stringify({ message: 'Internal server error occurred!' }),
		};
	} finally {
		pool.end();
	}
};
