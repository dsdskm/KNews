import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./components/Main";
import { initFirebaseApp } from "./common/FirebaseUtil";
import Edit from "./components/Edit";
import Detail from "./components/Detail";
import Join from "./components/Join";
import Category from "./components/Category";

const App = () => {
  initFirebaseApp();
  document.title = "KNews";

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} exact={true} />

          <Route path="/:channel/content/:category" element={<Category />} exact={true} />
          <Route path="/:channel/content/:category/edit/:id" element={<Edit />} exact={true} />
          <Route path="/:channel/content/:category/detail/:id" element={<Detail />} exact={true} />
          <Route path="/join" element={<Join />} exact={true} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
