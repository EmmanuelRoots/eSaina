
import Column from "../../components/column"
import PostComponent from "../../components/posts"
import { UsePost } from "../../context/post"
import  { type PostDTO, PostType } from "../../data/dto/post"
import { CenterSection, LeftSection, RightSection, SectionLayout } from "../layout/section"

const NewsPage = ()=> {
  const {loading}=UsePost()
  console.log(loading);
  
  const mockPosts = [...Array(200)].map((_, index) => {
    return {
      id : index,
      author: {
        firstName : 'Jhon',
        lastName : `Doe ${index}`,
        pdpUrl : 'https://lh3.googleusercontent.com/a/ACg8ocKM6Mn7P3AwgZGMFcBPOpdcW1Po-Jj4h0kHg0CCaIUozb6p3f0=s96-c'
      },
      content: `Ceci est le test numero ${index}`,
      comments: [],
      mediaUrls : [],
      reactions : [],
      salon :  '',
      type : PostType.TEXT,
      createdAt : '2025-10-17T08:32:29.046Z'
    } as unknown as PostDTO
  })

  return (
    <SectionLayout style={{height:"100vh"}}>
      <RightSection style={{flex : "1 1 20%"}}>
        <aside style={{ background: "#333", color: "#fff" }}>
          <button >Test</button>
        </aside>
      </RightSection>
      <CenterSection style={{flex : "1 1 65%", overflowY:"auto"}}>
        <Column style={{flex:1,padding:10}}>
          <PostComponent postsList={mockPosts}/>
        </Column>
      </CenterSection>
      <LeftSection style={{flex : "1 1 15%"}}>
        <Column ></Column>
      </LeftSection>
    </SectionLayout>
    
  )
}

export default NewsPage