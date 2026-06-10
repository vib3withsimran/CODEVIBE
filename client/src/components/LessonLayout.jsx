import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import NotesPanel from "./NotesPanel";

const LESSON_PATH_REGEX = /^\/(?:Html|Css|Js|C|Dbms|Dsa|Express|Mongo|Node|OOP|React)Lesson\d*$/i;

function extractLessonId(pathname) {
  return pathname.replace(/^\//, "");
}

const LessonLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isLessonPage = LESSON_PATH_REGEX.test(location.pathname);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <>
      <Outlet />
      {isLessonPage && <NotesPanel lessonId={extractLessonId(location.pathname)} lessonTitle={location.pathname.replace("/", "")} />}
    </>
  );
};

export default LessonLayout;
