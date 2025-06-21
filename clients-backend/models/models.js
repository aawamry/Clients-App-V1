import {initClientsDB} from '../data/clientsdatabase.js';
import {
	getAllQuery,
	getByFieldQuery,
	getByIdQuery,
	insertClientQuery,
	updateClientQuery,
	deleteClientQuery,
} from '../data/queries.js';

export async function getAllClientsModel() {
	console.log('📥 getAllClients called');
	const dbInstance = await initClientsDB();
	console.log('✅ Clients Database instance acquired');

	const clients = await dbInstance.all(getAllQuery('clients'));
	console.log('📄 Retrieved clients from DB:', clients.length);

	return clients;
}

export async function getClientsByFieldModel(field, value) {
	console.log(`🔍 getClientsByField called with field: ${field}, value: ${value}`);
	const dbInstance = await initClientsDB();
	console.log('✅ Database instance acquired');

	const allowedFields = [
		'id',
		'firstName',
		'lastName',
		'companyName',
		'region',
		'city',
		'dateOfBirth',
		'gender',
		'phone',
		'email'
	];

	if (!allowedFields.includes(field)) {
		console.error(`❌ Field ${field} is not allowed for searching.`);
		throw new Error(`Field ${field} is not allowed for searching.`);
	}

	const clients = await dbInstance.db.all(getByFieldQuery('clients', field), [`%${value}%`]);
	console.log('📄 Retrieved matching clients:', clients.length);

	return clients;
}

export const getClientByIdModel = async (id) => {
	try {
		const dbInstance = await initClientsDB();
		const client = await dbInstance.get(getByIdQuery('clients'), [id]);

		console.log('🔍 Raw DB client:', client); // Add this line


		if (!client) return null;

		// Map DB snake_case to frontend camelCase
		return {
			id: client.id,
			firstName: client.firstName,
			middleName: client.middleName,
			lastName: client.lastName,
			companyName: client.companyName,
			address: client.address,
			region: client.region,
			city: client.city,
			nationality: client.nationality,
			dateOfBirth: client.dateOfBirth,
			gender: client.gender,
			phone: client.phone?.split(',') || [],
			email: client.email
		};
	} catch (error) {
		console.error('Database error in getClientByIdModel:', error);
		throw error;
	}
};


export async function addClientModel({
	firstName,
	middleName,
	lastName,
	companyName,
	address,
	region,
	city,
	nationality,
	dateOfBirth,
	gender,
	phone = [],
	email,
}) {
	console.log('➕ addClient called with:', { firstName, lastName, companyName, phone, city, email });

	const dbInstance = await initClientsDB();
	console.log('✅ Database instance acquired');

	const phoneString = Array.isArray(phone) ? phone.join(',') : phone;

	const result = await dbInstance.run(insertClientQuery('clients'), [
		firstName,
		middleName,
		lastName,
		companyName,
		address,
		region,
		city,
		nationality,
		dateOfBirth,
		gender,
		phoneString,
		email,
	]);

	console.log('📤 Insert result:', result);

	if (result.changes > 0) {
		console.log('✅ Client added with ID:', result.lastID);
		return {
			id: result.lastID,
			firstName,
			middleName,
			lastName,
			companyName,
			address,
			region,
			city,
			nationality,
			dateOfBirth,
			gender,
			phone: phoneString,
			email,
		};
	} else {
		console.warn('⚠️ No Client was added.');
		return null;
	}
}

export async function updateClientModel({
	id,
	firstName,
	middleName,
	lastName,
	companyName,
	address = '',
	region = '',
	city,
	nationality,
	dateOfBirth,
	gender,
	phone = [],
	email
}) {
	const dbInstance = await initClientsDB();
	const phoneArray = Array.isArray(phone) ? phone : [phone];
	const phoneString = phoneArray.join(',');

	console.log('🔄 Updating client in DB with ID:', id);
	console.log('🔄 Update parameters:', [
		firstName,
		middleName,
		lastName,
		companyName,
		address,
		region,
		city,
		nationality,
		dateOfBirth,
		gender,
		phoneString,
		email,
		id
	]);

	try {
		const result = await dbInstance.run(updateClientQuery('clients'), [
			firstName,
			middleName,
			lastName,
			companyName,
			address,
			region,
			city,
			nationality,
			dateOfBirth,
			gender,
			phoneString,
			email,
			id
		]);

		console.log('🔄 DB update completed:', result);

		if (result.changes && result.changes > 0) {
			return {
				id,
				firstName,
				middleName,
				lastName,
				companyName,
				address,
				region,
				city,
				nationality,
				dateOfBirth,
				gender,
				phone: phoneString,
				email
			};
		}
	} catch (error) {
		console.error('❌ Error updating client:', error);
		throw error;
	}

	return null;
}

export async function deleteClientModel(id) {
	const dbInstance = await initClientsDB();
	await dbInstance.db.run(deleteClientQuery('clients'), [id]);
	return { message: `Client ${id} Deleted Successfully` };
}
