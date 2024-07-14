import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { CustomButton, Loading, TextInput } from "../components";
import { apiRequest } from "../utils";
const ResetPassword = () => {
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    console.log(data);
    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        url: "/users/request-passwordreset",
        data: data,
        method: "POST",
      });
      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        setUserId(res.data);

        setErrMsg(res);
      }
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
    }
  };
  const handleVerify = async () => {
    const data = getValues();
    console.log(data.code, userId, data.password);
    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        url: "/users/reset-password",
        data: {
          userId: userId,
          code: data.code,
          password: data.password,
        },
        method: "POST",
      });
      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        setErrMsg(res);
      }
    } catch (error) {
      console.log(error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full h-[100vh] bg-bgColor flex items-center justify-center p-6">
      <div className="bg-primary w-full md:w-1/3 2xl:w-1/4 px-6 py-8 shadow-md rounded-lg">
        <p className="text-ascent-1 text-lg font-semibold">Email Address</p>

        <span className="text-sm text-ascent-2">
          Enter email address used during registration
        </span>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="py-4 flex flex-col gap-5"
        >
          <TextInput
            name="email"
            placeholder="email@example.com"
            type="email"
            register={register("email", {
              required: "Email Address is required!",
            })}
            styles="w-full rounded-lg"
            labelStyle="ml-2"
            error={errors.email ? errors.email.message : ""}
          />
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
          <div className="w-full flex flex-col lg:flex-row gap-1 md:gap-2">
            <TextInput
              name="password"
              label="Password"
              placeholder="Password"
              type="password"
              styles="w-full"
              register={register("password", {
                required: "Password is required!",
              })}
              error={errors.password ? errors.password?.message : ""}
            />

            <TextInput
              label="Confirm Password"
              placeholder="Password"
              type="password"
              styles="w-full"
              register={register("cPassword", {
                validate: (value) => {
                  const { password } = getValues();
                  if (password !== value) {
                    return "Passwords do not match";
                  }
                },
              })}
              error={
                errors.cPassword && errors.cPassword.type === "validate"
                  ? errors.cPassword?.message
                  : ""
              }
            />
          </div>
          <div className="w-full flex flex-col xs:flex-row gap-1 md:gap-2 items-end">
            <TextInput
              name="code"
              label="Code"
              placeholder="Enter code"
              type="text"
              styles="w-full"
              register={register("code")}
            />
            {isSubmitting ? (
              <Loading />
            ) : (
              <CustomButton
                type="submit"
                containerStyles={` bg-[#0444a4] inline-flex justify-center h-12 rounded-md bg-blue-500 px-8 py-3 text-sm font-medium text-white outline-none`}
                title="Send"
              />
            )}
          </div>

  
            <CustomButton
              onClick={handleVerify}
              containerStyles={` bg-[#0444a4] inline-flex justify-center rounded-md bg-blue-500 px-8 py-3 text-sm font-medium text-white outline-none `}
              title="Reset"
            />
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
