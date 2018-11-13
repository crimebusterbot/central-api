function DomainName() {
    this.base = (url) => {
        var urlPattern = /^(?:https?:\/\/)?(?:w{3}\.)?([a-z\d\.-]+)\.(?:[a-z\.]{2,10})(?:[/\w\.-]*)*/;
        var domainPattern = url.match(urlPattern);
        var extractDomain = domainPattern[1];
        return extractDomain;
    }
}

module.exports = new DomainName();