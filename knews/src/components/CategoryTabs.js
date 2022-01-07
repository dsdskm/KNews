import React from "react";
import { useParams } from "react-router-dom";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Link } from "react-router-dom";
import CategoryDataHook from "../data/CategoryDataHook";

const CategoryTabs = ({ currentAccount }) => {
  const params = useParams();
  const channel = params.channel;
  let category = params.category;
  const isNormalMode =
    currentAccount &&
    (currentAccount.type === "normal" || (currentAccount.type !== "normal" && currentAccount.channel !== channel));

  const { categoryList } = CategoryDataHook(channel);
  const handleChange = (e) => {};
  if (category === "-1" && categoryList.length > 0) {
    category = categoryList[0].id;
  }
  const tabList = categoryList.filter((c) => c.open || !isNormalMode);
  return (
    <>
      <Tabs
        centered
        value={category}
        onChange={handleChange}
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        {tabList.map((c) => {
          const label = c.open ? c.name : c.name + "(비공개)";
          return <Tab key={c.id} label={label} value={c.id} component={Link} to={`/${channel}/content/${c.id}`} />;
        })}
      </Tabs>
    </>
  );
};

export default CategoryTabs;
