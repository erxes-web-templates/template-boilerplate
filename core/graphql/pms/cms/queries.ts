import { GET_CMS_POST, GET_CMS_POSTS, GET_CMS_POST_LIST } from "../../queries";

const postDetail = GET_CMS_POST;
const posts = GET_CMS_POSTS;
const postList = GET_CMS_POST_LIST;

const queries = { postDetail, posts, postList };
export default queries;
