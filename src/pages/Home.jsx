import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CustomButton,
  EditProfile,
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TextInput,
  TopBar,
} from "../components";
import { Link } from "react-router-dom";
import { NoProfile } from "../assets";
import { BsPersonFillAdd, BsMusicNote } from "react-icons/bs";
import { FaFileAlt } from "react-icons/fa";

import { BiImages, BiSolidVideo } from "react-icons/bi";
import { useForm } from "react-hook-form";
import {
  apiRequest,
  getUserInfo,
  handleFileUpload,
  likePost,
  sendFriendRequest,
  deletePost,
  fetchPosts,
} from "../utils";
import { UserLogin } from "../redux/userSlice";

const Home = () => {
  const dispatch = useDispatch();
  const { user, edit } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.posts);
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handlePostSubmit = async (data) => {
    setPosting(true);
    setErrMsg("");
    if (file) {
      console.log(file);
    } else {
      console.log("noooooooooooooooooooooooooo");
    }
    try {
      const uri =
        file && (await handleFileUpload(file, file.type.split("/")[0]));
      const newData = uri
        ? { ...data, file: { url: uri, type: file.type.split("/")[0] } }
        : data;
      console.log(newData);
      const res = await apiRequest({
        url: "/posts/create-post",
        data: newData,
        token: user?.token,
        method: "POST",
      });
      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        reset({ description: "" });
        setFile(null);
        setErrMsg(res);
        await fetchPost();
      }
      setPosting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  const fetchPost = async () => {
    await fetchPosts(user?.token, dispatch);
    setLoading(false);
  };
  const handleLikePost = async (uri) => {
    await likePost({ uri: uri, token: user?.token });
    await fetchPost();
  };
  const handleDelete = async (id) => {
    await deletePost(id, user.token);
    await fetchPost();
  };
  const fetchFriendRequests = async () => {
    try {
      const res = await apiRequest({
        url: "/users/get-friend-request",
        token: user?.token,
        method: "POST",
      });
      setFriendRequest(res?.data);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchSuggestedFriends = async () => {
    try {
      const res = await apiRequest({
        url: "/users/suggested-friends",
        token: user?.token,
        method: "POST",
      });
      setSuggestedFriends(res?.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleFriendRequest = async (id) => {
    try {
      console.log( user.token,id)
      const res = await sendFriendRequest(user.token, id);
      await fetchSuggestedFriends();
    } catch (error) {
      console.log(error);
    }
  };
  const acceptFriendRequest = async (id, status) => {
    try {
      const res = await apiRequest({
        url: "/users/accept-request",
        token: user?.token,
        method: "POST",
        data: { rid: id, status },
      });
      setFriendRequest(res?.data);
    } catch (error) {
      console.log(error);
    }
  };
  const getUser = async () => {
    const res = await getUserInfo(user?.token);
    const newData = { token: user?.token, ...res };
    dispatch(UserLogin(newData));
  };
  useEffect(() => {
    setLoading(true);
    getUser();
    fetchPost();
    fetchFriendRequests();
    fetchSuggestedFriends();
  }, []);
  return (
    <>
      <div className="w-full px-0  bg-bgColor   overflow-hidden">
        <TopBar />

        <div className="w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full flex-wrap">
          <div className="w-full lg:w-1/3 xl:w-1/4 h-full md:flex flex-col px-4 overflow-y-auto">
           
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>
          <div className="flex-1 h-full px-4 flex flex-col gap-6 overflow-y-auto rounded-lg">
            <form
              onSubmit={handleSubmit(handlePostSubmit)}
              className="bg-primary px-4 rounded-lg"
            >
              <div className="w-full flex items-center gap-2 py-4 border-b border-[#66666645]">
                <img
                  src={user?.profileUrl ?? NoProfile}
                  alt="User Image"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <TextInput
                  styles="w-full rounded-full py-5"
                  placeholder="What's on your mind...."
                  name="description"
                  register={register("description", {
                    required: "Write something about post",
                  })}
                  error={errors.description ? errors.description.message : ""}
                />
              </div>
              {errMsg?.message && (
                <span
                  role="alert"
                  className={`text-sm ${
                    errMsg?.status === "failed"
                      ? "text-[#f64949fe]"
                      : "text-[#2ba150fe]"
                  } mt-0.5`}
                >
                  {errMsg?.message}
                </span>
              )}

              <div className="flex items-center flex-wrap justify-between  py-4">
                <label
                  htmlFor="imgUpload"
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer px-1"
                >
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="imgUpload"
                    data-max-size="5120"
                    accept=".jpg, .png, .jpeg, .gif, .webp"
                  />
                  <BiImages />
                  <span>Image</span>
                </label>

                <label
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer px-1"
                  htmlFor="audioUpload"
                >
                  <input
                    type="file"
                    data-max-size="5120"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="audioUpload"
                    accept=".mp3, .wav"
                  />
                  <BsMusicNote />
                  <span>Audio</span>
                </label>

                <label
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer px-1"
                  htmlFor="videoUpload"
                >
                  <input
                    type="file"
                    data-max-size="5120"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="videoUpload"
                    accept=".mp4, .wav"
                  />
                  <BiSolidVideo />
                  <span>Video</span>
                </label>
                <label
                  className="flex items-center gap-1 px-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
                  htmlFor="documentUpload"
                >
                  <input
                    type="file"
                    data-max-size="5120"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="documentUpload"
                    accept=".pdf, .doc, .docx, .txt, .rtf, .odt, .xlsx, .xls, .ppt, .pptx"
                  />
                  <FaFileAlt />
                  <span>Document</span>
                </label>

                <div>
                  {posting ? (
                    <Loading />
                  ) : (
                    <CustomButton
                      type="submit"
                      title="Post"
                      containerStyles="bg-[#0444a4] text-white py-1 px-6 rounded-full font-semibold text-sm"
                    />
                  )}
                </div>
              </div>
            </form>

            {loading ? (
              <Loading />
            ) : posts?.length > 0 ? (
              posts?.map((post) => (
                <PostCard
                  key={post?._id}
                  post={post}
                  user={user}
                  deletePost={handleDelete}
                  likePost={handleLikePost}
                />
              ))
            ) : (
              <div className="flex w-full h-full items-center justify-center">
                <p className="text-lg text-ascent-2">No Post Available</p>
              </div>
            )}
          </div>
          <div className="w-full px-4 lg:w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto">
         
            <div className="w-full bg-primary shadow-sm rounded-lg px-6 py-5">
              <div className="flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]">
                <span> Friend Request</span>
                <span>{friendRequest?.length}</span>
              </div>

              <div className="w-full flex flex-col gap-4 pt-4">
                {friendRequest?.map(({ _id, requestFrom: from }) => (
                  <div key={_id} className="flex items-center justify-between">
                    <Link
                      to={"/profile/" + from?._id}
                      className="w-full flex gap-4 items-center cursor-pointer"
                    >
                      <img
                        src={from?.profileUrl ?? NoProfile}
                        alt={from?.firstName}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-base font-medium text-ascent-1">
                          {from?.firstName} {from?.lastName}
                        </p>
                        <span className="text-sm text-ascent-2">
                          {from?.profession ?? "No Profession"}
                        </span>
                      </div>
                    </Link>

                    <div className="flex gap-1">
                      <CustomButton
                        onClick={() => acceptFriendRequest(_id, "Accepted")}
                        title="Accept"
                        containerStyles="bg-[#0444a4] text-xs text-white px-1.5 py-1 rounded-full"
                      />
                      <CustomButton
                        onClick={() => acceptFriendRequest(_id, "Denied")}
                        title="Deny"
                        containerStyles="border border-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="py-4">
              <div className="w-full bg-primary shadow-sm rounded-lg px-5 py-5">
                <div className="flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]">
                  <span>Friend Suggestion</span>
                </div>
                <div className="w-full flex flex-col gap-4 pt-4">
                  {suggestedFriends?.map((friend) => (
                    <div
                      className="flex items-center justify-between"
                      key={friend._id}
                    >
                      <Link
                        to={"/profile/" + friend?._id}
                        key={friend?._id}
                        className="w-full flex gap-4 items-center cursor-pointer"
                      >
                        <img
                          src={friend?.profileUrl ?? NoProfile}
                          alt={friend?.firstName}
                          className="w-10 h-10 object-cover rounded-full"
                        />
                        <div className="flex-1 ">
                          <p className="text-base font-medium text-ascent-1">
                            {friend?.firstName} {friend?.lastName}
                          </p>
                          <span className="text-sm text-ascent-2">
                            {friend?.profession ?? "No Profession"}
                          </span>
                        </div>
                      </Link>

                      <div className="flex gap-1">
                        <button
                          className="bg-[#0444a430] text-sm text-white p-1 rounded"
                          onClick={() => handleFriendRequest(friend?._id)}
                        >
                          <BsPersonFillAdd
                            size={20}
                            className="text-[#0f52b6]"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {edit && <EditProfile />}
    </>
  );
};

export default Home;
