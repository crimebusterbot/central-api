function DomainName() {
    this.base = (url) => {
        const urlPattern = /^(?:https?:\/\/)?(?:w{3}\.)?([a-z\d\.-]+)\.(?:[a-z\.]{2,10})(?:[/\w\.-]*)*/;
        const domainPattern = url.match(urlPattern);
        const extractDomain = domainPattern[1];
        return extractDomain;
    }
}

module.exports = new DomainName();