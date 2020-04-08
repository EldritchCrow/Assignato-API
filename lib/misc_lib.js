

module.exports = {
    filterObj: function(obj, keys) {
        return Object.keys(obj)
            .filter(k => keys.includes(k))
            .reduce((o, k) => {
                o[k] = obj[k];
                return o;
            }, {});
    }
}