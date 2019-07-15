import { Controller, Post, Body, Get, Put, Delete } from "@nestjs/common";
import { BlogService } from "./blog.service";

@Controller('blogs')
export class BlogController {

    constructor(private blogService: BlogService) { }

    @Post('addBlogPost')
    async addBlogPost(@Body('blogHeader') blogHeader: string, @Body('blogContent') blogContent: string) {
        const generatedId = await this.blogService.insertBlog(blogHeader, blogContent);
        return { status: 'SUCCESS', message: 'Blog added successfully', id: generatedId };
    }

    @Get('getBlogs')
    async getListOfBlogs() {
        const blogList = await this.blogService.getListOfBlogs();
        return { status: 'SUCCESS', blogList: blogList };
    }

    @Post('getSelectedBlog')
    async getSelectedBlog(@Body('_id') id: string) {
        const blogList = await this.blogService.getSelectedBlog(id);
        return { status: 'SUCCESS', blogList: blogList };
    }

    @Post('addComments')
    async addComments(@Body('_id') id: string, @Body('comments') comment: string) {
        const blogList = await this.blogService.addCommentsNew(id, comment);
        return { status: 'SUCCESS', message: 'Comment added successfully' };
    }

    @Delete('deleteBlog')
    async deleteBlog(@Body('_id') id: string) {
        await this.blogService.deleteBlog(id);
        return { status: 'SUCCESS', message: 'Blog deleted successfully' };
    }

    @Put('editComments')
    async editComments(@Body('blogId') blogId: string, @Body('commentId') commentId: string, @Body('commentText') commentText: string) {
        const blogList = await this.blogService.updateCommentNew(blogId, commentId, commentText);
        return { status: 'SUCCESS', message: 'Comment edited successfully' };
    }

    @Delete('deleteComments')
    async deleteComments(@Body('blogId') blogId: string, @Body('commentId') commentId: string) {
        const blogList = await this.blogService.deleteCommentNew(blogId, commentId);
        return { status: 'SUCCESS', message: 'Comment deleted successfully' };
    }

    @Put('updateBlog')
    async updateBlog(@Body('blogId') blogId: string, @Body('blogHeader') blogHeader: string, @Body('blogContent') blogContent: string) {
        const blogList = await this.blogService.updateBlog(blogId, blogHeader, blogContent);
        return { status: 'SUCCESS', message: 'Blog updated successfully' };
    }
}