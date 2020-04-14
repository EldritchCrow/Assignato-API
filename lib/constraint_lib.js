

function docToObject(x) {
    switch (x.type) {
        case "time":
            return docToTimeConstraint(x);
        default:
            return zeroConstraint;
    }
    return x;
}

var zeroConstraint = {
    apply_to: "all",
    weight: 0.0,
    evaluate: function (_) {
        return 0.0;
    }
}

function docToTimeConstraint(x) {
    return {
        apply_to: x.apply_to,
        weight: x.weight,
        min_time: x.options.min_time,
        max_time: x.options.max_time,
        evaluate: function (assign) {
            if (!checkApplies(this.apply_to, assign))
                return 0.0;
            var dist = Math.abs(this.min_time - assign.start);
            // if (this.min_time > assign.start)
            //     dist = (this.min_time - assign.start) / 100;
            // if (this.max_time < assign.end)
            //     dist = (assign.end - this.max_time) / 100;
            return Math.pow(this.weight * 10, 10) * dist;
        }
    }
}

function checkApplies(apply_to, assign) {
    if (apply_to == 'all')
        return true;
    if (apply_to == "class" && assign.crn == undefined)
        return false;
    if (apply_to == "item" && assign.crn != undefined)
        return false;
    if (apply_to === parseInt(apply_to) && parseInt(assign.crn) != apply_to)
        return false;
    return true;
}

module.exports = {
    docToObject: docToObject
}