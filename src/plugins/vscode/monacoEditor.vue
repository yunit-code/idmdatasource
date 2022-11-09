<template>
  <div ref="monaco" :style="style"></div>
</template>
<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
// import * as monaco from "monaco-editor/esm/vs/editor/editor.main.js";
// import "monaco-editor/esm/vs/languages/ts"
import "monaco-editor/esm/vs/language/json/monaco.contribution";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import "monaco-editor/esm/vs/basic-languages/sql/sql.contribution";
// import 'monaco-editor/esm/vs/editor/editor.all.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
// import 'monaco-editor/esm/vs/editor/contrib/format/format.js';
// import 'monaco-editor/esm/vs/editor/contrib/codeAction/codeAction.js';
// import 'monaco-editor/esm/vs/editor/contrib/codeAction/codeActionMenu.js';
// import 'monaco-editor/esm/vs/editor/contrib/codeAction/codeActionUi.js';

// var debounce = require('lodash.debounce');
export default {
  name: "MonacoEditor",
  props: {
    width: {
      type: [String, Number],
      default: "100%",
    },
    height: {
      type: [String, Number],
      default: "100%",
    },
    code: {
      type: String,
      default: "",
    },
    srcPath: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "javascript",
    },
    theme: {
      type: String,
      default: "vs",
    }, // vs,vs-dark, hc-black
    options: {
      type: Object,
      default: () => {},
    },
    changeThrottle: {
      type: Number,
      default: 0,
    },
    lineNumbersMinChars: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      defaults: {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: "line",
        automaticLayout: false,
        glyphMargin: true,
      },
    };
  },
  computed: {
    style() {
      const { width, height } = this;
      const fixedWidth = width.toString().indexOf("%") !== -1 ? width : `${width}px`;
      const fixedHeight = height.toString().indexOf("%") !== -1 ? height : `${height}px`;
      return {
        width: fixedWidth,
        height: fixedHeight,
      };
    },
    editorOptions() {
      return Object.assign({}, this.defaults, this.options, {
        // value: this.code,
        language: this.language,
        theme: this.theme,
        lineNumbersMinChars: 2
      });
    },
  },
  mounted() {
    this.fetchEditor();
  },
  destroyed() {
    this.destroyMonaco();
  },
  methods: {
    getContent() {
      console.log("monacoEditor", this.editor);
      return this.editor.getValue();
    },
    setContent(v) {
      if (this.editor) {
        this.editor.setValue(v);
        setTimeout(() => {
          this.formatDocument();
        }, 100);
      }
    },
    modifyPosition(column, lineNumber) {
      if (this.editor) {
        this.editor.setPosition({ column, lineNumber });
        this.editor.focus();
        // this.editor.revealLine(lineNumber)
        this.editor.revealLineInCenter(lineNumber);
      }
    },
    addAction(funName) {
      var r = "export function " + funName + "(ctx) {\n  \n}";
      var n = this.editor;
      var e = n.getModel().getLineCount();
      n.getModel().applyEdits([
        {
          text: "\n\n" + r,
          range: new monaco.Range(e + 1, 0, e + 1, 0),
        },
      ]),
        n.revealLineInCenter(e);
      var t = r.split("\n").length;
      setTimeout(() => {
        n.setPosition({
          column: 3,
          lineNumber: e + t,
        }),
          n.focus();
      }, 100);
    },
    addCode(code) {
      var n = this.editor;
      var e = n.getModel().getLineCount();
      n.getModel().applyEdits([
        {
          text: "\n\n" + code,
          range: new monaco.Range(e + 1, 0, e + 1, 0),
        },
      ]);
    },
    formatDocument() {
      if (this.editor) {
        this.editor.getAction(["editor.action.formatDocument"]) &&
          this.editor.getAction(["editor.action.formatDocument"])._run();
      }
    },
    updateTheme(value) {
      if (this.editor) {
        var newOp = Object.assign({}, this.defaults, this.options, {
          // value: this.code,
          language: this.language,
          theme: this.theme,
        });
        newOp.theme = value;
        this.editor.updateOptions(newOp);
      }
    },
    editorHasLoaded(editor, monaco) {
      this.editor = editor;
      this.monaco = monaco;
      this.editor.onDidChangeModelContent((event) =>
        this.codeChangeHandler(editor, event)
      );
      this.$emit("mounted", editor);
    },
    codeChangeHandler: function (editor) {
      if (this.codeChangeEmitter) {
        this.codeChangeEmitter(editor);
      } else {
        this.codeChangeEmitter = _.debounce(function (editor) {
          this.$emit("codeChange", editor);
        }, this.changeThrottle);
        this.codeChangeEmitter(editor);
      }
    },
    fetchEditor() {
      this.createMonaco();
    },
    createMonaco() {
      let isID = false;
      let isIDMContext = false;
      this.editor = monaco.editor.create(this.$refs.monaco, this.editorOptions);
      this.editor.setValue(this.code);
      this.editorHasLoaded(this.editor, monaco);
      ["javascript"].map((item) => {
        monaco.languages.registerCompletionItemProvider(item, {
          provideCompletionItems(model, position) {
            const line = position.lineNumber;
            // 获取当前列数
            // const column = position.column
            // 获取当前输入行的所有内容
            const content = model.getLineContent(line);
            isID = content.match(/\bID$/g);
            if (isID) {
              return {
                suggestions: [
                  {
                    label: "IDM",
                    kind: monaco.languages.CompletionItemKind["Function"],
                    insertText: "IDM",
                    detail: "",
                  },
                ],
              };
            } else {
              isIDMContext = content.match(/\bIDM(\.|\.([$a-zA-Z_][$a-zA-Z0-9_]*)\.)$/g);
              if (isIDMContext) {
                let kinds = monaco.languages.CompletionItemKind;
                let arr = [];
                let obj = eval(isIDMContext[0].substr(0, isIDMContext[0].length - 1));
                if (obj) {
                  for (let k in obj) {
                    arr.push({
                      label: k,
                      kind:
                        IDM.type(obj[k]) == "function"
                          ? kinds["Function"]
                          : kinds["Module"],
                      insertText: k,
                      detail: "",
                    });
                  }
                  return {
                    suggestions: arr,
                  };
                } else {
                  return {
                    suggestions: arr,
                  };
                }
              }
            }
          },
          triggerCharacters: ["."],
        });
      });
    },
    destroyMonaco() {
      if (typeof this.editor !== "undefined") {
        this.editor.dispose();
      }
    },
    layout() {
      this.editor && this.editor.layout();
    },
  },
};
</script>
