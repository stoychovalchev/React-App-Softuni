  
import React, { useState, useContext } from 'react';
import ApolloClient from 'apollo-boost';
import { gql } from 'apollo-boost';
import { useQuery, useLazyQuery, useSubscription } from '@apollo/react-hooks';
import { AuthContext } from '../context/authContext';
import { useHistory } from 'react-router-dom';
import { GET_ALL_POSTS, TOTAL_POSTS } from '../graphql/queries';
import { POST_ADDED, POST_UPDATED, POST_DELETED } from '../graphql/subscriptions';
import PostCard from '../components/PostCard';
import PostPagination from '../components/PostPagination';
import { toast } from 'react-toastify';

const Home = () => {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useQuery(GET_ALL_POSTS, {
    variables: { page }
  });
  const { data: postCount } = useQuery(TOTAL_POSTS);

  const { data: newPost } = useSubscription(POST_ADDED, {
    onSubscriptionData: async ({ client: { cache }, subscriptionData: { data } }) => {

      const { allPosts } = cache.readQuery({
        query: GET_ALL_POSTS,
        variables: { page }
      });



      cache.writeQuery({
        query: GET_ALL_POSTS,
        variables: { page },
        data: {
          allPosts: [data.postAdded, ...allPosts]
        }
      });

      fetchPosts({
        variables: { page },
        refetchQueries: [{ query: GET_ALL_POSTS, variables: { page } }]
      });

      toast.success('New post!');
    }
  });

  const { data: updatedPost } = useSubscription(POST_UPDATED, {
    onSubscriptionData: () => {
      toast.success('Post updated!');
    }
  });

  const { data: deletedPost } = useSubscription(POST_DELETED, {
    onSubscriptionData: async ({ client: { cache }, subscriptionData: { data } }) => {

      const { allPosts } = cache.readQuery({
        query: GET_ALL_POSTS,
        variables: { page }
      });


      let filteredPosts = allPosts.filter((p) => p._id !== data.postDeleted._id);


      cache.writeQuery({
        query: GET_ALL_POSTS,
        variables: { page },
        data: {
          allPosts: filteredPosts
        }
      });

      fetchPosts({
        variables: { page },
        refetchQueries: [{ query: GET_ALL_POSTS, variables: { page } }]
      });

      toast.error('Post deleted!');
    }
  });

  const [fetchPosts, { data: posts }] = useLazyQuery(GET_ALL_POSTS);

  const { state, dispatch } = useContext(AuthContext);

  let history = useHistory();

  const updateUserName = () => {
    dispatch({
      type: 'LOGGED_IN_USER',
      payload: 'Stoycho'
    });
  };

  if (loading) return <p className="p-5">Loading...</p>;

  return (
    <div className="container">
      <div className="row p-5">
        {data &&
          data.allPosts.map((post) => (
            <div className="col-md-4 pt-5" key={post._id}>
              <PostCard post={post} />
            </div>
          ))}
      </div>

      <PostPagination page={page} setPage={setPage} postCount={postCount} />
      {/*      <hr />
      {JSON.stringify(newPost)}
      <hr />
      {JSON.stringify(state.user)}
      <hr />
      {JSON.stringify(history)}*/}
    </div>
  );
};

export default Home;
