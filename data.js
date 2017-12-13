var customers = {
    '111-222-333-1': {
        name: 'John Smith',
        email: 'john@example.com',
        faceImageUrl: ''
    },
    '111-222-333-2': {
        name: 'Markus Müller',
        email: 'markus@example.com',
        faceImageUrl: ''
    },
    '111-222-333-3': {
        name: 'Bill Doors',
        email: 'bill@example.com',
        faceImageUrl: ''
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