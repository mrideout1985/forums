const PostsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: "flex" }}>
      <aside style={{ width: "20%" }}>
        <h2>Posts Sidebar</h2>
        {/* Add sidebar content */}
      </aside>
      <section style={{ width: "80%" }}>{children}</section>
    </div>
  );
};

export default PostsLayout;
