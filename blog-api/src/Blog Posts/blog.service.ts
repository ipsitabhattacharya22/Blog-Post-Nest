import { Injectable, NotFoundException, InternalServerErrorException, BadGatewayException, BadRequestException } from "@nestjs/common";
import { BlogModel } from './blog.model';
let Cloudant = require('@cloudant/cloudant');
let user = '8882e309-4dc0-41c5-bddd-31caa09e324e-bluemix'; // Set this to your own account.
let password = 'a888b2491f6d541e8cbc2618d144c7f68184472515e4ff4834d6b0b1549b433c';
let cloudant = Cloudant({ account: user, password: password });

@Injectable()
export class BlogService {
    blogs: BlogModel[] = [];
    comments: any[] = [];

    // Insert Blog

    async insertBlog(blogHeader: string, blogContent: string) {
        try {
            const newBlog = {
                blogHeader: blogHeader,
                blogContent: blogContent,
                createdAt: new Date().toISOString(),
                totalComments: 0,
                comments: []
            };

            const result = await cloudant.use('mydb').insert(newBlog);
            return result.id as string;
        } catch (e) {
            throw new InternalServerErrorException('Could not add a new blog');
        }
    }

    // Update Blog

    async updateBlog(blogId: string, blogHeader: string, blogContent: string) {
        try {
            const res = await cloudant.use('mydb').find({
                "selector": {
                    "_id": blogId
                }
            });
            if (!res || res.docs[0].length === 0) {
                throw new NotFoundException('Could not find blog');
            }
            try {
                const updatedBlog = {
                    blogHeader: blogHeader,
                    blogContent: blogContent,
                    _id: res.docs[0]._id,
                    _rev: res.docs[0]._rev,
                    createdAt: res.docs[0].createdAt,
                    totalComments: res.docs[0].totalComments,
                    comments: res.docs[0].comments
                };
                const res1 = await cloudant.use('mydb').insert(updatedBlog);
                console.log(res1);
            } catch (e) {
                throw new BadRequestException('Could not update blog');
            }

        } catch (e) {
            throw new InternalServerErrorException('Could not update blog')
        }
    }

    // Get List Of All Blogs

    async getListOfBlogs() {
        try {
            const res = await cloudant.use('mydb').find({
                "selector": {}
            });
            const sortedList = res.docs.sort((var1, var2) => {
                let a = new Date(var1.createdAt);
                let b = new Date(var2.createdAt);
                if (a > b)
                    return 1;
                if (a < b)
                    return -1;
                return 0;
            })
            console.log(sortedList);
            return sortedList;
        } catch (e) {
            throw new NotFoundException('Could not find blog');
        }
    }

    // Get Selected Blog

    async getSelectedBlog(id: string) {
        try {
            const res = await cloudant.use('mydb').find({
                "selector": {
                    "_id": id
                }
            });
            return res.docs;
        } catch (e) {
            throw new NotFoundException('Could not find blog');
        }
    }

    // Add comments to blog

    async addCommentsNew(id: string, comment: string) {
        try {
            const commentId = await this.generateCommentId(id);
            const comments = {
                _id: commentId,
                text: comment
            };
            try {
                const res = await cloudant.use('mydb').find({
                    "selector": {
                        "_id": id
                    }
                });
                let updatedComments = res.docs[0].comments;
                updatedComments.push(comments);
                const updatedBlog = {
                    blogHeader: res.docs[0].blogHeader,
                    blogContent: res.docs[0].blogContent,
                    _id: res.docs[0]._id,
                    _rev: res.docs[0]._rev,
                    createdAt: res.docs[0].createdAt,
                    totalComments: res.docs[0].totalComments + 1,
                    comments: updatedComments
                };
                const res1 = await cloudant.use('mydb').insert(updatedBlog);
                console.log(res1);
            } catch (e) {
                throw new BadRequestException();
            }
        } catch (e) {
            throw new InternalServerErrorException('Something went wrong.. Could not add comment.')
        }
    }

    // delete blog

    async deleteBlog(id: string) {
        try {
            const res = await cloudant.use('mydb').find({
                "selector": {
                    "_id": id
                }
            });
            try {
                const res1 = await cloudant.use('mydb').destroy(res.docs[0]._id, res.docs[0]._rev);
                console.log(res1);
            } catch (e) {
                throw new InternalServerErrorException('Could not delete blog');
            }
        } catch (e) {
            throw new NotFoundException('Could not find blog');
        }
    }

    // update comment

    async updateCommentNew(blogId: string, commentId: string, commentText: string) {
        const blogRes = await cloudant.use('mydb').find({
            "selector": {
                "_id": blogId,
                "comments": {
                    "$elemMatch": {
                        "_id": commentId
                    }
                }
            }
        });
        if (!blogRes || blogRes.docs.length === 0) {
            throw new NotFoundException('Could not find blog');
        }
        try {
            if (blogRes.docs.length > 0) {
                blogRes.docs[0].comments.filter(comment => {
                    if (comment._id === commentId) {
                        comment._id = commentId;
                        comment.text = commentText;
                    }
                });
                console.log('Updated now: ', blogRes.docs[0].comments);
                let updatedComments = blogRes.docs[0].comments;
                const updatedBlog = {
                    blogHeader: blogRes.docs[0].blogHeader,
                    blogContent: blogRes.docs[0].blogContent,
                    _id: blogRes.docs[0]._id,
                    _rev: blogRes.docs[0]._rev,
                    createdAt: blogRes.docs[0].createdAt,
                    totalComments: blogRes.docs[0].totalComments,
                    comments: updatedComments
                };
                const res1 = await cloudant.use('mydb').insert(updatedBlog);
                console.log(res1);

            }
        } catch (e) {
            throw new InternalServerErrorException('Could not update comment');
        }

    }

    // delete comment

    async deleteCommentNew(blogId: string, commentId: string) {
        const blogRes = await cloudant.use('mydb').find({
            "selector": {
                "_id": blogId,
                "comments": {
                    "$elemMatch": {
                        "_id": commentId
                    }
                }
            }
        });
        if (!blogRes || blogRes.docs.length === 0) {
            throw new NotFoundException('Could not find blog');
        }
        try {
            if (blogRes.docs.length > 0) {
                blogRes.docs[0].comments.filter((comment, index) => {
                    if (comment._id === commentId) {
                        blogRes.docs[0].comments.splice(index, 1);
                    }
                });
                console.log('Updated now: ', blogRes.docs[0].comments);
                let updatedComments = blogRes.docs[0].comments;
                const updatedBlog = {
                    blogHeader: blogRes.docs[0].blogHeader,
                    blogContent: blogRes.docs[0].blogContent,
                    _id: blogRes.docs[0]._id,
                    _rev: blogRes.docs[0]._rev,
                    createdAt: blogRes.docs[0].createdAt,
                    totalComments: blogRes.docs[0].comments.length,
                    comments: updatedComments
                };
                const res2 = await cloudant.use('mydb').insert(updatedBlog);
                console.log(res2);
            }
        } catch (e) {
            throw new InternalServerErrorException('Could not delete comment');
        }

    }

    // Generate Unique Comment Id

    async generateCommentId(blogId: string) {
        let ind;
        let commentPresent = false;
        let lastCommentId;
        let newCommentId;
        const blogList = await this.getListOfBlogs();
        blogList.filter((blog, index) => {
            if (blog._id === blogId) {
                const blogIndex = blog._id.toString();
                const subString = blogIndex.substring(blogIndex.length - 5);
                ind = subString.toUpperCase();
                console.log(ind);
                if (blog.comments.length > 0) {
                    commentPresent = true;
                    const k = blog.comments.length;
                    lastCommentId = blog.comments[k - 1]._id;
                } else {
                    commentPresent = false;
                }
            }
        });
        if (commentPresent) {
            const splittedString = lastCommentId.split('COM');
            console.log(splittedString);
            const newIndex = parseInt(splittedString[1]) + 1;
            console.log(newIndex);
            newCommentId = 'BL' + ind + 'COM' + this.padStart(newIndex.toString(), 3, '0');
            console.log(newCommentId);
        } else {
            newCommentId = 'BL' + ind + 'COM' + '001';
            console.log(newCommentId);
        }
        return newCommentId;
    }

    padStart(str, targetLength, padString) {
        if (this.isInteger(targetLength) && targetLength > 1) {
            padString = String(typeof padString !== 'undefined' ? padString : ' ');
            if (str.length >= targetLength) {
                return str;
            } else {
                targetLength = targetLength - str.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength / padString.length); // append to original to ensure we are longer than needed
                }
                return padString.slice(0, targetLength) + str;
            }
        } else {
            return str;
        }
    }

    isInteger(value) {
        return typeof value === 'number' &&
            isFinite(value) &&
            Math.floor(value) === value;
    }
}