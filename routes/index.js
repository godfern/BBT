var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/product/getProduct', function (req, res) {
    // var fsn =
});

router.post('/product/bargain', function (req, res) {
    var bargain_price = req.body.bargain_price;
    var fsn = req.body.fsn;

    getProduct(fsn, bargain_price, function (bargain_price, result) {
        var mrp = result.mrp;
        var max_discount = result.max_discount;
        var variable_discount = result.variable_discount;
        var discount_limit = result.discount_limit;
        var selling_price = mrp;
        var bargain_status;

        // TODO Update the tries
        console.log(bargain_price);
        if (bargain_price > variable_discount) {
            bargain_status = false;
            // should return tries alse
        } else {
            // Yay! we have him some discount
            if (bargain_price <= variable_discount) {

                if (bargain_price < max_discount) {
                    var bargain_difference = max_discount - bargain_price;
                    if (variable_discount + bargain_difference > discount_limit) {
                        // TODO update discount to table vd = dl;
                    }
                }
                if (bargain_price < max_discount) {
                    bargain_status = true;
                    selling_price = mrp - bargain_price;
                }
            }
        }

        res.json({
            bargain_status: bargain_status,
            selling_price: selling_price
        });
    });

    //check if he
    // res.status(200).send({1:1});
});


router.post('/product/checkout', function (req, res) {

})

function getProduct(fsn, bp, callback) {
    callback(bp, {
        mrp: 5000,
        max_discount: 500,
        variable_discount: 600,
        discount_limit: 800
    });
}

module.exports = router;
