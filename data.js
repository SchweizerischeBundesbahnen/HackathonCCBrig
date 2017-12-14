var customers = {
    '111-222-333-1': {
        firstName: 'Hans',
        lastName: 'Huggentobler',
        birthday: '1948-12-03',
        email: 'hans@example.com'
    },
    '111-222-333-2': {
        firstName: 'Markus',
        lastName: 'Müller',
        birthday: '1970-04-12',
        email: 'markus@example.com'
    },
    '111-222-333-3': {
        firstName: 'Bernhard',
        lastName: 'Knüsel',
        birthday: '1978-06-10',
        email: 'bernhard@example.com'
    },
    '111-222-333-4': {
        firstName: 'Daniela',
        lastName: 'Huber',
        birthday: '1985-10-07',
        email: 'daniela@example.com'
    },
    '111-222-333-5': {
        firstName: 'Samantha',
        lastName: 'Fischer',
        birthday: '1990-02-15',
        email: 'samantha@example.com'
    },
};


var receipts = {

    '111-222-333-1': {
        '2017-12-11': ['739112111', '739112222'],
        '2017-12-12': ['750112661', '750112662', '750112663', '750112664'],
        '2017-12-13': ['739112333'],
    },

    '111-222-333-2': {
        '2017-12-11': ['739110001'],
        '2017-12-12': ['739110002'],
        '2017-12-13': ['739110003'],
    }

};

module.exports.customers = customers;
module.exports.receipts = receipts;