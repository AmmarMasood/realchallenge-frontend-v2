import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

function TextEditor({ value, setValue }) {
  function handChange(e, editor) {
    const data = editor.getData();
    setValue(data);
  }
  return <CKEditor editor={ClassicEditor} data={value} onChange={handChange} />;
}

export default TextEditor;
