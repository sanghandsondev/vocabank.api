
class APIFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }
    // BUILD QUERY
    filter() {
        // 1A) Filtering
        let queryObj = { ...this.queryString }   // lưu các biến req.query vào 1 object
        const excludedFields = ['page', 'sort', 'limit', 'fields']  //các query bị loại bỏ nếu có gọi ra trên url
        excludedFields.forEach(el => delete queryObj[el])
        // 1B) Advanced filtering
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        this.query = this.query.find(JSON.parse(queryStr))
        return this
    }
    sort() {
        // 2) Sorting        
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            // console.log(sortBy)
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-createdAt')    // default:  The Newest -> Oldest
        }
        return this

    }
    limitFields() {
        // 3) Field limiting
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields)      // .select()    => chọn ra các trường muốn lấy để gửi lên client
        } else {
            this.query = this.query.select('-__v')     //default: ko lấy "__v" gửi lên client
        }
        return this
    }
    paginate() {
        // 4) Pagination
        // ?page=2&limit=10   =>  page1: 1-10   ;   page2 : 11-20   ;  page3: 21-30  ; .....
        const page = this.queryString.page * 1 || 1    //default page 1
        const limit = this.queryString.limit * 1 || 20;    //default limit = 20
        const skip = (page - 1) * limit

        this.query = this.query.skip(skip).limit(limit)
        return this
    }
}

module.exports = APIFeatures
