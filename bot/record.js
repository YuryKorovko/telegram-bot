function Report() {
    // always initialize all instance properties
    this.ID = '';
    this.type ='';
    this.position = '';
    this.overview = '';
    this.fio='';
    this.email ='';
    this.otdel = '';
    this.timestamp = '';
    this.step = 0;
    this.isAnonymous = false;
}
// export the class
module.exports = Report;