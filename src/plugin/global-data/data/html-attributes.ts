// To get data
// 1. Go to https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
// 2. Run script at '../../../../scripts/get-html-attributes.js'
export const HTML_ATTRS: Record<
  string,
  { name: string; desc: string; type: 'boolean' | 'string' }[]
> = {
  form: [
    {
      name: 'accept',
      desc: 'List of types the server accepts, typically a file type.',
      type: 'string',
    },
    {
      name: 'accept-charset',
      desc: 'List of supported charsets.',
      type: 'string',
    },
    {
      name: 'action',
      desc: 'The URI of a program that processes the information submitted via the form.',
      type: 'string',
    },
    {
      name: 'autocomplete',
      desc: 'Indicates whether controls in this form can by default have their values automatically completed by the browser.',
      type: 'string',
    },
    {
      name: 'enctype',
      desc: 'Defines the content type of the form data when the method is POST.',
      type: 'string',
    },
    {
      name: 'method',
      desc: 'Defines which HTTP method to use when submitting the form. Can be GET (default) or POST.',
      type: 'string',
    },
    {
      name: 'name',
      desc: 'Name of the element. For example used by the server to identify the fields in form submits.',
      type: 'string',
    },
    {
      name: 'novalidate',
      desc: "This attribute indicates that the form shouldn't be validated when submitted.",
      type: 'string',
    },
    {
      name: 'target',
      desc: 'Specifies where to open the linked document (in the case of an <a> element) or where to display the response received (in the case of a <form> element)',
      type: 'string',
    },
  ],
  input: [
    {
      name: 'accept',
      desc: 'List of types the server accepts, typically a file type.',
      type: 'string',
    },
    {
      name: 'alt',
      desc: "Alternative text in case an image can't be displayed.",
      type: 'string',
    },
    {
      name: 'autocomplete',
      desc: 'Indicates whether controls in this form can by default have their values automatically completed by the browser.',
      type: 'string',
    },
    {
      name: 'capture',
      desc: 'From the Media Capture specification, specifies a new file can be captured.',
      type: 'string',
    },
    {
      name: 'checked',
      desc: 'Indicates whether the element should be checked on page load.',
      type: 'string',
    },
    {
      name: 'dirname',
      desc: '',
      type: 'string',
    },
    {
      name: 'disabled',
      desc: 'Indicates whether the user can interact with the element.',
      type: 'string',
    },
    {
      name: 'form',
      desc: 'Indicates the form that is the owner of the element.',
      type: 'string',
    },
    {
      name: 'formaction',
      desc: 'Indicates the action of the element, overriding the action defined in the <form>.',
      type: 'string',
    },
    {
      name: 'formenctype',
      desc: 'If the button/input is a submit button (e.g. type="submit"), this attribute sets the encoding type to use during form submission. If this attribute is specified, it overrides the enctype attribute of the button\'s form owner.',
      type: 'string',
    },
    {
      name: 'formmethod',
      desc: 'If the button/input is a submit button (e.g. type="submit"), this attribute sets the submission method to use during form submission (GET, POST, etc.). If this attribute is specified, it overrides the method attribute of the button\'s form owner.',
      type: 'string',
    },
    {
      name: 'formnovalidate',
      desc: 'If the button/input is a submit button (e.g. type="submit"), this boolean attribute specifies that the form is not to be validated when it is submitted. If this attribute is specified, it overrides the novalidate attribute of the button\'s form owner.',
      type: 'boolean',
    },
    {
      name: 'formtarget',
      desc: 'If the button/input is a submit button (e.g. type="submit"), this attribute specifies the browsing context (for example, tab, window, or inline frame) in which to display the response that is received after submitting the form. If this attribute is specified, it overrides the target attribute of the button\'s form owner.',
      type: 'string',
    },
    {
      name: 'height',
      desc: 'Specifies the height of elements listed here. For all other elements, use the CSS height property.\n\nNote: In some instances, such as <div>, this is a legacy attribute, in which case the CSS height property should be used instead.',
      type: 'string',
    },
    {
      name: 'list',
      desc: 'Identifies a list of pre-defined options to suggest to the user.',
      type: 'string',
    },
    {
      name: 'max',
      desc: 'Indicates the maximum value allowed.',
      type: 'string',
    },
    {
      name: 'maxlength',
      desc: 'Defines the maximum number of characters allowed in the element.',
      type: 'string',
    },
    {
      name: 'minlength',
      desc: 'Defines the minimum number of characters allowed in the element.',
      type: 'string',
    },
    {
      name: 'min',
      desc: 'Indicates the minimum value allowed.',
      type: 'string',
    },
    {
      name: 'multiple',
      desc: 'Indicates whether multiple values can be entered in an input of the type email or file.',
      type: 'string',
    },
    {
      name: 'name',
      desc: 'Name of the element. For example used by the server to identify the fields in form submits.',
      type: 'string',
    },
    {
      name: 'pattern',
      desc: "Defines a regular expression which the element's value will be validated against.",
      type: 'string',
    },
    {
      name: 'placeholder',
      desc: 'Provides a hint to the user of what can be entered in the field.',
      type: 'string',
    },
    {
      name: 'readonly',
      desc: 'Indicates whether the element can be edited.',
      type: 'string',
    },
    {
      name: 'required',
      desc: 'Indicates whether this element is required to fill out or not.',
      type: 'string',
    },
    {
      name: 'size',
      desc: "Defines the width of the element (in pixels). If the element's type attribute is text or password then it's the number of characters.",
      type: 'string',
    },
    {
      name: 'src',
      desc: 'The URL of the embeddable content.',
      type: 'string',
    },
    {
      name: 'step',
      desc: '',
      type: 'string',
    },
    {
      name: 'type',
      desc: 'Defines the type of the element.',
      type: 'string',
    },
    {
      name: 'usemap',
      desc: '',
      type: 'string',
    },
    {
      name: 'value',
      desc: 'Defines a default value which will be displayed in the element on page load.',
      type: 'string',
    },
    {
      name: 'width',
      desc: "For the elements listed here, this establishes the element's width.\n\nNote: For all other instances, such as <div>, this is a legacy attribute, in which case the CSS width property should be used instead.",
      type: 'string',
    },
  ],
  caption: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
  ],
  col: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
    {
      name: 'bgcolor',
      desc: 'Background color of the element.\n\nNote: This is a legacy attribute. Please use the CSS background-color property instead.',
      type: 'string',
    },
    {
      name: 'span',
      desc: '',
      type: 'string',
    },
  ],
  colgroup: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
    {
      name: 'bgcolor',
      desc: 'Background color of the element.\n\nNote: This is a legacy attribute. Please use the CSS background-color property instead.',
      type: 'string',
    },
    {
      name: 'span',
      desc: '',
      type: 'string',
    },
  ],
  hr: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
    {
      name: 'color',
      desc: 'This attribute sets the text color using either a named color or a color specified in the hexadecimal #RRGGBB format.\n\nNote: This is a legacy attribute. Please use the CSS color property instead.',
      type: 'string',
    },
  ],
  iframe: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
    {
      name: 'allow',
      desc: 'Specifies a feature-policy for the iframe.',
      type: 'string',
    },
    {
      name: 'csp \nExperimental',
      desc: 'Specifies the Content Security Policy that an embedded document must agree to enforce upon itself.',
      type: 'string',
    },
    {
      name: 'height',
      desc: 'Specifies the height of elements listed here. For all other elements, use the CSS height property.\n\nNote: In some instances, such as <div>, this is a legacy attribute, in which case the CSS height property should be used instead.',
      type: 'string',
    },
    {
      name: 'loading \nExperimental',
      desc: 'Indicates if the element should be loaded lazily (loading="lazy") or loaded immediately (loading="eager").',
      type: 'string',
    },
    {
      name: 'name',
      desc: 'Name of the element. For example used by the server to identify the fields in form submits.',
      type: 'string',
    },
    {
      name: 'referrerpolicy',
      desc: 'Specifies which referrer is sent when fetching the resource.',
      type: 'string',
    },
    {
      name: 'sandbox',
      desc: 'Stops a document loaded in an iframe from using certain features (such as submitting forms or opening new windows).',
      type: 'string',
    },
    {
      name: 'src',
      desc: 'The URL of the embeddable content.',
      type: 'string',
    },
    {
      name: 'srcdoc',
      desc: '',
      type: 'string',
    },
    {
      name: 'width',
      desc: "For the elements listed here, this establishes the element's width.\n\nNote: For all other instances, such as <div>, this is a legacy attribute, in which case the CSS width property should be used instead.",
      type: 'string',
    },
  ],
  img: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
    {
      name: 'alt',
      desc: "Alternative text in case an image can't be displayed.",
      type: 'string',
    },
    {
      name: 'border',
      desc: 'The border width.\n\nNote: This is a legacy attribute. Please use the CSS border property instead.',
      type: 'string',
    },
    {
      name: 'crossorigin',
      desc: 'How the element handles cross-origin requests',
      type: 'string',
    },
    {
      name: 'decoding',
      desc: 'Indicates the preferred method to decode the image.',
      type: 'string',
    },
    {
      name: 'height',
      desc: 'Specifies the height of elements listed here. For all other elements, use the CSS height property.\n\nNote: In some instances, such as <div>, this is a legacy attribute, in which case the CSS height property should be used instead.',
      type: 'string',
    },
    {
      name: 'intrinsicsize \nDeprecated',
      desc: "This attribute tells the browser to ignore the actual intrinsic size of the image and pretend it's the size specified in the attribute.",
      type: 'string',
    },
    {
      name: 'ismap',
      desc: 'Indicates that the image is part of a server-side image map.',
      type: 'string',
    },
    {
      name: 'loading \nExperimental',
      desc: 'Indicates if the element should be loaded lazily (loading="lazy") or loaded immediately (loading="eager").',
      type: 'string',
    },
    {
      name: 'referrerpolicy',
      desc: 'Specifies which referrer is sent when fetching the resource.',
      type: 'string',
    },
    {
      name: 'sizes',
      desc: '',
      type: 'string',
    },
    {
      name: 'src',
      desc: 'The URL of the embeddable content.',
      type: 'string',
    },
    {
      name: 'srcset',
      desc: 'One or more responsive image candidates.',
      type: 'string',
    },
    {
      name: 'usemap',
      desc: '',
      type: 'string',
    },
    {
      name: 'width',
      desc: "For the elements listed here, this establishes the element's width.\n\nNote: For all other instances, such as <div>, this is a legacy attribute, in which case the CSS width property should be used instead.",
      type: 'string',
    },
  ],
  table: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
    {
      name: 'background',
      desc: 'Specifies the URL of an image file.\n\nNote: Although browsers and email clients may still support this attribute, it is obsolete. Use CSS background-image instead.',
      type: 'string',
    },
    {
      name: 'bgcolor',
      desc: 'Background color of the element.\n\nNote: This is a legacy attribute. Please use the CSS background-color property instead.',
      type: 'string',
    },
    {
      name: 'border',
      desc: 'The border width.\n\nNote: This is a legacy attribute. Please use the CSS border property instead.',
      type: 'string',
    },
    {
      name: 'summary \nDeprecated',
      desc: '',
      type: 'string',
    },
  ],
  tbody: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
    {
      name: 'bgcolor',
      desc: 'Background color of the element.\n\nNote: This is a legacy attribute. Please use the CSS background-color property instead.',
      type: 'string',
    },
  ],
  td: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
    {
      name: 'background',
      desc: 'Specifies the URL of an image file.\n\nNote: Although browsers and email clients may still support this attribute, it is obsolete. Use CSS background-image instead.',
      type: 'string',
    },
    {
      name: 'bgcolor',
      desc: 'Background color of the element.\n\nNote: This is a legacy attribute. Please use the CSS background-color property instead.',
      type: 'string',
    },
    {
      name: 'colspan',
      desc: 'The colspan attribute defines the number of columns a cell should span.',
      type: 'string',
    },
    {
      name: 'headers',
      desc: 'IDs of the <th> elements which applies to this element.',
      type: 'string',
    },
    {
      name: 'rowspan',
      desc: 'Defines the number of rows a table cell should span over.',
      type: 'string',
    },
  ],
  tfoot: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
    {
      name: 'bgcolor',
      desc: 'Background color of the element.\n\nNote: This is a legacy attribute. Please use the CSS background-color property instead.',
      type: 'string',
    },
  ],
  th: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
    {
      name: 'background',
      desc: 'Specifies the URL of an image file.\n\nNote: Although browsers and email clients may still support this attribute, it is obsolete. Use CSS background-image instead.',
      type: 'string',
    },
    {
      name: 'bgcolor',
      desc: 'Background color of the element.\n\nNote: This is a legacy attribute. Please use the CSS background-color property instead.',
      type: 'string',
    },
    {
      name: 'colspan',
      desc: 'The colspan attribute defines the number of columns a cell should span.',
      type: 'string',
    },
    {
      name: 'headers',
      desc: 'IDs of the <th> elements which applies to this element.',
      type: 'string',
    },
    {
      name: 'rowspan',
      desc: 'Defines the number of rows a table cell should span over.',
      type: 'string',
    },
    {
      name: 'scope',
      desc: 'Defines the cells that the header test (defined in the th element) relates to.',
      type: 'string',
    },
  ],
  thead: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
  ],
  tr: [
    {
      name: 'align \nDeprecated',
      desc: 'Specifies the horizontal alignment of the element.',
      type: 'string',
    },
    {
      name: 'bgcolor',
      desc: 'Background color of the element.\n\nNote: This is a legacy attribute. Please use the CSS background-color property instead.',
      type: 'string',
    },
  ],
  area: [
    {
      name: 'alt',
      desc: "Alternative text in case an image can't be displayed.",
      type: 'string',
    },
    {
      name: 'coords',
      desc: 'A set of values specifying the coordinates of the hot-spot region.',
      type: 'string',
    },
    {
      name: 'download',
      desc: 'Indicates that the hyperlink is to be used for downloading a resource.',
      type: 'string',
    },
    {
      name: 'href',
      desc: 'The URL of a linked resource.',
      type: 'string',
    },
    {
      name: 'media',
      desc: 'Specifies a hint of the media for which the linked resource was designed.',
      type: 'string',
    },
    {
      name: 'ping',
      desc: 'The ping attribute specifies a space-separated list of URLs to be notified if a user follows the hyperlink.',
      type: 'string',
    },
    {
      name: 'referrerpolicy',
      desc: 'Specifies which referrer is sent when fetching the resource.',
      type: 'string',
    },
    {
      name: 'rel',
      desc: 'Specifies the relationship of the target object to the link object.',
      type: 'string',
    },
    {
      name: 'shape',
      desc: '',
      type: 'string',
    },
    {
      name: 'target',
      desc: 'Specifies where to open the linked document (in the case of an <a> element) or where to display the response received (in the case of a <form> element)',
      type: 'string',
    },
  ],
  script: [
    {
      name: 'async',
      desc: 'Executes the script asynchronously.',
      type: 'string',
    },
    {
      name: 'crossorigin',
      desc: 'How the element handles cross-origin requests',
      type: 'string',
    },
    {
      name: 'defer',
      desc: 'Indicates that the script should be executed after the page has been parsed.',
      type: 'string',
    },
    {
      name: 'integrity',
      desc: 'Specifies a Subresource Integrity value that allows browsers to verify what they fetch.',
      type: 'string',
    },
    {
      name: 'language \nDeprecated',
      desc: 'Defines the script language used in the element.',
      type: 'string',
    },
    {
      name: 'referrerpolicy',
      desc: 'Specifies which referrer is sent when fetching the resource.',
      type: 'string',
    },
    {
      name: 'src',
      desc: 'The URL of the embeddable content.',
      type: 'string',
    },
    {
      name: 'type',
      desc: 'Defines the type of the element.',
      type: 'string',
    },
  ],
  select: [
    {
      name: 'autocomplete',
      desc: 'Indicates whether controls in this form can by default have their values automatically completed by the browser.',
      type: 'string',
    },
    {
      name: 'disabled',
      desc: 'Indicates whether the user can interact with the element.',
      type: 'string',
    },
    {
      name: 'form',
      desc: 'Indicates the form that is the owner of the element.',
      type: 'string',
    },
    {
      name: 'multiple',
      desc: 'Indicates whether multiple values can be entered in an input of the type email or file.',
      type: 'string',
    },
    {
      name: 'name',
      desc: 'Name of the element. For example used by the server to identify the fields in form submits.',
      type: 'string',
    },
    {
      name: 'required',
      desc: 'Indicates whether this element is required to fill out or not.',
      type: 'string',
    },
    {
      name: 'size',
      desc: "Defines the width of the element (in pixels). If the element's type attribute is text or password then it's the number of characters.",
      type: 'string',
    },
  ],
  textarea: [
    {
      name: 'autocomplete',
      desc: 'Indicates whether controls in this form can by default have their values automatically completed by the browser.',
      type: 'string',
    },
    {
      name: 'cols',
      desc: 'Defines the number of columns in a textarea.',
      type: 'string',
    },
    {
      name: 'dirname',
      desc: '',
      type: 'string',
    },
    {
      name: 'disabled',
      desc: 'Indicates whether the user can interact with the element.',
      type: 'string',
    },
    {
      name: 'enterkeyhint \nExperimental',
      desc: 'The enterkeyhint specifies what action label (or icon) to present for the enter key on virtual keyboards. The attribute can be used with form controls (such as the value of textarea elements), or in elements in an editing host (e.g., using contenteditable attribute).',
      type: 'string',
    },
    {
      name: 'form',
      desc: 'Indicates the form that is the owner of the element.',
      type: 'string',
    },
    {
      name: 'inputmode',
      desc: 'Provides a hint as to the type of data that might be entered by the user while editing the element or its contents. The attribute can be used with form controls (such as the value of textarea elements), or in elements in an editing host (e.g., using contenteditable attribute).',
      type: 'string',
    },
    {
      name: 'maxlength',
      desc: 'Defines the maximum number of characters allowed in the element.',
      type: 'string',
    },
    {
      name: 'minlength',
      desc: 'Defines the minimum number of characters allowed in the element.',
      type: 'string',
    },
    {
      name: 'name',
      desc: 'Name of the element. For example used by the server to identify the fields in form submits.',
      type: 'string',
    },
    {
      name: 'placeholder',
      desc: 'Provides a hint to the user of what can be entered in the field.',
      type: 'string',
    },
    {
      name: 'readonly',
      desc: 'Indicates whether the element can be edited.',
      type: 'string',
    },
    {
      name: 'required',
      desc: 'Indicates whether this element is required to fill out or not.',
      type: 'string',
    },
    {
      name: 'rows',
      desc: 'Defines the number of rows in a text area.',
      type: 'string',
    },
    {
      name: 'wrap',
      desc: 'Indicates whether the text should be wrapped.',
      type: 'string',
    },
  ],
  audio: [
    {
      name: 'autoplay',
      desc: 'The audio or video should play as soon as possible.',
      type: 'string',
    },
    {
      name: 'buffered',
      desc: 'Contains the time range of already buffered media.',
      type: 'string',
    },
    {
      name: 'controls',
      desc: 'Indicates whether the browser should show playback controls to the user.',
      type: 'string',
    },
    {
      name: 'crossorigin',
      desc: 'How the element handles cross-origin requests',
      type: 'string',
    },
    {
      name: 'loop',
      desc: "Indicates whether the media should start playing from the start when it's finished.",
      type: 'string',
    },
    {
      name: 'muted',
      desc: 'Indicates whether the audio will be initially silenced on page load.',
      type: 'string',
    },
    {
      name: 'preload',
      desc: 'Indicates whether the whole resource, parts of it or nothing should be preloaded.',
      type: 'string',
    },
    {
      name: 'src',
      desc: 'The URL of the embeddable content.',
      type: 'string',
    },
  ],
  video: [
    {
      name: 'autoplay',
      desc: 'The audio or video should play as soon as possible.',
      type: 'string',
    },
    {
      name: 'buffered',
      desc: 'Contains the time range of already buffered media.',
      type: 'string',
    },
    {
      name: 'controls',
      desc: 'Indicates whether the browser should show playback controls to the user.',
      type: 'string',
    },
    {
      name: 'crossorigin',
      desc: 'How the element handles cross-origin requests',
      type: 'string',
    },
    {
      name: 'height',
      desc: 'Specifies the height of elements listed here. For all other elements, use the CSS height property.\n\nNote: In some instances, such as <div>, this is a legacy attribute, in which case the CSS height property should be used instead.',
      type: 'string',
    },
    {
      name: 'loop',
      desc: "Indicates whether the media should start playing from the start when it's finished.",
      type: 'string',
    },
    {
      name: 'muted',
      desc: 'Indicates whether the audio will be initially silenced on page load.',
      type: 'string',
    },
    {
      name: 'playsinline',
      desc: 'A Boolean attribute indicating that the video is to be played "inline"; that is, within the element\'s playback area. Note that the absence of this attribute does not imply that the video will always be played in fullscreen.',
      type: 'string',
    },
    {
      name: 'poster',
      desc: 'A URL indicating a poster frame to show until the user plays or seeks.',
      type: 'string',
    },
    {
      name: 'preload',
      desc: 'Indicates whether the whole resource, parts of it or nothing should be preloaded.',
      type: 'string',
    },
    {
      name: 'src',
      desc: 'The URL of the embeddable content.',
      type: 'string',
    },
    {
      name: 'width',
      desc: "For the elements listed here, this establishes the element's width.\n\nNote: For all other instances, such as <div>, this is a legacy attribute, in which case the CSS width property should be used instead.",
      type: 'string',
    },
  ],
  body: [
    {
      name: 'background',
      desc: 'Specifies the URL of an image file.\n\nNote: Although browsers and email clients may still support this attribute, it is obsolete. Use CSS background-image instead.',
      type: 'string',
    },
    {
      name: 'bgcolor',
      desc: 'Background color of the element.\n\nNote: This is a legacy attribute. Please use the CSS background-color property instead.',
      type: 'string',
    },
  ],
  marquee: [
    {
      name: 'bgcolor',
      desc: 'Background color of the element.\n\nNote: This is a legacy attribute. Please use the CSS background-color property instead.',
      type: 'string',
    },
    {
      name: 'loop',
      desc: "Indicates whether the media should start playing from the start when it's finished.",
      type: 'string',
    },
  ],
  object: [
    {
      name: 'border',
      desc: 'The border width.\n\nNote: This is a legacy attribute. Please use the CSS border property instead.',
      type: 'string',
    },
    {
      name: 'data',
      desc: 'Specifies the URL of the resource.',
      type: 'string',
    },
    {
      name: 'form',
      desc: 'Indicates the form that is the owner of the element.',
      type: 'string',
    },
    {
      name: 'height',
      desc: 'Specifies the height of elements listed here. For all other elements, use the CSS height property.\n\nNote: In some instances, such as <div>, this is a legacy attribute, in which case the CSS height property should be used instead.',
      type: 'string',
    },
    {
      name: 'name',
      desc: 'Name of the element. For example used by the server to identify the fields in form submits.',
      type: 'string',
    },
    {
      name: 'type',
      desc: 'Defines the type of the element.',
      type: 'string',
    },
    {
      name: 'usemap',
      desc: '',
      type: 'string',
    },
    {
      name: 'width',
      desc: "For the elements listed here, this establishes the element's width.\n\nNote: For all other instances, such as <div>, this is a legacy attribute, in which case the CSS width property should be used instead.",
      type: 'string',
    },
  ],
  meta: [
    {
      name: 'charset',
      desc: 'Declares the character encoding of the page or script.',
      type: 'string',
    },
    {
      name: 'content',
      desc: 'A value associated with http-equiv or name depending on the context.',
      type: 'string',
    },
    {
      name: 'http-equiv',
      desc: 'Defines a pragma directive.',
      type: 'string',
    },
    {
      name: 'name',
      desc: 'Name of the element. For example used by the server to identify the fields in form submits.',
      type: 'string',
    },
  ],
  blockquote: [
    {
      name: 'cite',
      desc: 'Contains a URI which points to the source of the quote or change.',
      type: 'string',
    },
  ],
  del: [
    {
      name: 'cite',
      desc: 'Contains a URI which points to the source of the quote or change.',
      type: 'string',
    },
    {
      name: 'datetime',
      desc: 'Indicates the date and time associated with the element.',
      type: 'string',
    },
  ],
  ins: [
    {
      name: 'cite',
      desc: 'Contains a URI which points to the source of the quote or change.',
      type: 'string',
    },
    {
      name: 'datetime',
      desc: 'Indicates the date and time associated with the element.',
      type: 'string',
    },
  ],
  q: [
    {
      name: 'cite',
      desc: 'Contains a URI which points to the source of the quote or change.',
      type: 'string',
    },
  ],
  font: [
    {
      name: 'color',
      desc: 'This attribute sets the text color using either a named color or a color specified in the hexadecimal #RRGGBB format.\n\nNote: This is a legacy attribute. Please use the CSS color property instead.',
      type: 'string',
    },
  ],
  link: [
    {
      name: 'crossorigin',
      desc: 'How the element handles cross-origin requests',
      type: 'string',
    },
    {
      name: 'href',
      desc: 'The URL of a linked resource.',
      type: 'string',
    },
    {
      name: 'hreflang',
      desc: 'Specifies the language of the linked resource.',
      type: 'string',
    },
    {
      name: 'integrity',
      desc: 'Specifies a Subresource Integrity value that allows browsers to verify what they fetch.',
      type: 'string',
    },
    {
      name: 'media',
      desc: 'Specifies a hint of the media for which the linked resource was designed.',
      type: 'string',
    },
    {
      name: 'referrerpolicy',
      desc: 'Specifies which referrer is sent when fetching the resource.',
      type: 'string',
    },
    {
      name: 'rel',
      desc: 'Specifies the relationship of the target object to the link object.',
      type: 'string',
    },
    {
      name: 'sizes',
      desc: '',
      type: 'string',
    },
    {
      name: 'type',
      desc: 'Defines the type of the element.',
      type: 'string',
    },
  ],
  time: [
    {
      name: 'datetime',
      desc: 'Indicates the date and time associated with the element.',
      type: 'string',
    },
  ],
  track: [
    {
      name: 'default',
      desc: "Indicates that the track should be enabled unless the user's preferences indicate something different.",
      type: 'string',
    },
    {
      name: 'kind',
      desc: 'Specifies the kind of text track.',
      type: 'string',
    },
    {
      name: 'label',
      desc: 'Specifies a user-readable title of the element.',
      type: 'string',
    },
    {
      name: 'src',
      desc: 'The URL of the embeddable content.',
      type: 'string',
    },
    {
      name: 'srclang',
      desc: '',
      type: 'string',
    },
  ],
  button: [
    {
      name: 'disabled',
      desc: 'Indicates whether the user can interact with the element.',
      type: 'string',
    },
    {
      name: 'form',
      desc: 'Indicates the form that is the owner of the element.',
      type: 'string',
    },
    {
      name: 'formaction',
      desc: 'Indicates the action of the element, overriding the action defined in the <form>.',
      type: 'string',
    },
    {
      name: 'formenctype',
      desc: 'If the button/input is a submit button (e.g. type="submit"), this attribute sets the encoding type to use during form submission. If this attribute is specified, it overrides the enctype attribute of the button\'s form owner.',
      type: 'string',
    },
    {
      name: 'formmethod',
      desc: 'If the button/input is a submit button (e.g. type="submit"), this attribute sets the submission method to use during form submission (GET, POST, etc.). If this attribute is specified, it overrides the method attribute of the button\'s form owner.',
      type: 'string',
    },
    {
      name: 'formnovalidate',
      desc: 'If the button/input is a submit button (e.g. type="submit"), this boolean attribute specifies that the form is not to be validated when it is submitted. If this attribute is specified, it overrides the novalidate attribute of the button\'s form owner.',
      type: 'boolean',
    },
    {
      name: 'formtarget',
      desc: 'If the button/input is a submit button (e.g. type="submit"), this attribute specifies the browsing context (for example, tab, window, or inline frame) in which to display the response that is received after submitting the form. If this attribute is specified, it overrides the target attribute of the button\'s form owner.',
      type: 'string',
    },
    {
      name: 'name',
      desc: 'Name of the element. For example used by the server to identify the fields in form submits.',
      type: 'string',
    },
    {
      name: 'type',
      desc: 'Defines the type of the element.',
      type: 'string',
    },
    {
      name: 'value',
      desc: 'Defines a default value which will be displayed in the element on page load.',
      type: 'string',
    },
  ],
  fieldset: [
    {
      name: 'disabled',
      desc: 'Indicates whether the user can interact with the element.',
      type: 'string',
    },
    {
      name: 'form',
      desc: 'Indicates the form that is the owner of the element.',
      type: 'string',
    },
    {
      name: 'name',
      desc: 'Name of the element. For example used by the server to identify the fields in form submits.',
      type: 'string',
    },
  ],
  optgroup: [
    {
      name: 'disabled',
      desc: 'Indicates whether the user can interact with the element.',
      type: 'string',
    },
    {
      name: 'label',
      desc: 'Specifies a user-readable title of the element.',
      type: 'string',
    },
  ],
  option: [
    {
      name: 'disabled',
      desc: 'Indicates whether the user can interact with the element.',
      type: 'string',
    },
    {
      name: 'label',
      desc: 'Specifies a user-readable title of the element.',
      type: 'string',
    },
    {
      name: 'selected',
      desc: 'Defines a value which will be selected on page load.',
      type: 'string',
    },
    {
      name: 'value',
      desc: 'Defines a default value which will be displayed in the element on page load.',
      type: 'string',
    },
  ],
  a: [
    {
      name: 'download',
      desc: 'Indicates that the hyperlink is to be used for downloading a resource.',
      type: 'string',
    },
    {
      name: 'href',
      desc: 'The URL of a linked resource.',
      type: 'string',
    },
    {
      name: 'hreflang',
      desc: 'Specifies the language of the linked resource.',
      type: 'string',
    },
    {
      name: 'media',
      desc: 'Specifies a hint of the media for which the linked resource was designed.',
      type: 'string',
    },
    {
      name: 'ping',
      desc: 'The ping attribute specifies a space-separated list of URLs to be notified if a user follows the hyperlink.',
      type: 'string',
    },
    {
      name: 'referrerpolicy',
      desc: 'Specifies which referrer is sent when fetching the resource.',
      type: 'string',
    },
    {
      name: 'rel',
      desc: 'Specifies the relationship of the target object to the link object.',
      type: 'string',
    },
    {
      name: 'shape',
      desc: '',
      type: 'string',
    },
    {
      name: 'target',
      desc: 'Specifies where to open the linked document (in the case of an <a> element) or where to display the response received (in the case of a <form> element)',
      type: 'string',
    },
  ],
  contenteditable: [
    {
      name: 'enterkeyhint \nExperimental',
      desc: 'The enterkeyhint specifies what action label (or icon) to present for the enter key on virtual keyboards. The attribute can be used with form controls (such as the value of textarea elements), or in elements in an editing host (e.g., using contenteditable attribute).',
      type: 'string',
    },
    {
      name: 'inputmode',
      desc: 'Provides a hint as to the type of data that might be entered by the user while editing the element or its contents. The attribute can be used with form controls (such as the value of textarea elements), or in elements in an editing host (e.g., using contenteditable attribute).',
      type: 'string',
    },
  ],
  label: [
    {
      name: 'for',
      desc: 'Describes elements which belongs to this one.',
      type: 'string',
    },
    {
      name: 'form',
      desc: 'Indicates the form that is the owner of the element.',
      type: 'string',
    },
  ],
  output: [
    {
      name: 'for',
      desc: 'Describes elements which belongs to this one.',
      type: 'string',
    },
    {
      name: 'form',
      desc: 'Indicates the form that is the owner of the element.',
      type: 'string',
    },
    {
      name: 'name',
      desc: 'Name of the element. For example used by the server to identify the fields in form submits.',
      type: 'string',
    },
  ],
  meter: [
    {
      name: 'form',
      desc: 'Indicates the form that is the owner of the element.',
      type: 'string',
    },
    {
      name: 'high',
      desc: 'Indicates the lower bound of the upper range.',
      type: 'string',
    },
    {
      name: 'low',
      desc: 'Indicates the upper bound of the lower range.',
      type: 'string',
    },
    {
      name: 'max',
      desc: 'Indicates the maximum value allowed.',
      type: 'string',
    },
    {
      name: 'min',
      desc: 'Indicates the minimum value allowed.',
      type: 'string',
    },
    {
      name: 'optimum',
      desc: 'Indicates the optimal numeric value.',
      type: 'string',
    },
    {
      name: 'value',
      desc: 'Defines a default value which will be displayed in the element on page load.',
      type: 'string',
    },
  ],
  progress: [
    {
      name: 'form',
      desc: 'Indicates the form that is the owner of the element.',
      type: 'string',
    },
    {
      name: 'max',
      desc: 'Indicates the maximum value allowed.',
      type: 'string',
    },
    {
      name: 'value',
      desc: 'Defines a default value which will be displayed in the element on page load.',
      type: 'string',
    },
  ],
  canvas: [
    {
      name: 'height',
      desc: 'Specifies the height of elements listed here. For all other elements, use the CSS height property.\n\nNote: In some instances, such as <div>, this is a legacy attribute, in which case the CSS height property should be used instead.',
      type: 'string',
    },
    {
      name: 'width',
      desc: "For the elements listed here, this establishes the element's width.\n\nNote: For all other instances, such as <div>, this is a legacy attribute, in which case the CSS width property should be used instead.",
      type: 'string',
    },
  ],
  embed: [
    {
      name: 'height',
      desc: 'Specifies the height of elements listed here. For all other elements, use the CSS height property.\n\nNote: In some instances, such as <div>, this is a legacy attribute, in which case the CSS height property should be used instead.',
      type: 'string',
    },
    {
      name: 'src',
      desc: 'The URL of the embeddable content.',
      type: 'string',
    },
    {
      name: 'type',
      desc: 'Defines the type of the element.',
      type: 'string',
    },
    {
      name: 'width',
      desc: "For the elements listed here, this establishes the element's width.\n\nNote: For all other instances, such as <div>, this is a legacy attribute, in which case the CSS width property should be used instead.",
      type: 'string',
    },
  ],
  base: [
    {
      name: 'href',
      desc: 'The URL of a linked resource.',
      type: 'string',
    },
    {
      name: 'target',
      desc: 'Specifies where to open the linked document (in the case of an <a> element) or where to display the response received (in the case of a <form> element)',
      type: 'string',
    },
  ],
  html: [
    {
      name: 'manifest \nDeprecated',
      desc: 'Specifies the URL of the document\'s cache manifest.\n\nNote: This attribute is obsolete, use <link rel="manifest"> instead.',
      type: 'string',
    },
  ],
  source: [
    {
      name: 'media',
      desc: 'Specifies a hint of the media for which the linked resource was designed.',
      type: 'string',
    },
    {
      name: 'sizes',
      desc: '',
      type: 'string',
    },
    {
      name: 'src',
      desc: 'The URL of the embeddable content.',
      type: 'string',
    },
    {
      name: 'srcset',
      desc: 'One or more responsive image candidates.',
      type: 'string',
    },
    {
      name: 'type',
      desc: 'Defines the type of the element.',
      type: 'string',
    },
  ],
  style: [
    {
      name: 'media',
      desc: 'Specifies a hint of the media for which the linked resource was designed.',
      type: 'string',
    },
    {
      name: 'scoped \nNon-standard\n \nDeprecated',
      desc: '',
      type: 'string',
    },
    {
      name: 'type',
      desc: 'Defines the type of the element.',
      type: 'string',
    },
  ],
  map: [
    {
      name: 'name',
      desc: 'Name of the element. For example used by the server to identify the fields in form submits.',
      type: 'string',
    },
  ],
  param: [
    {
      name: 'name',
      desc: 'Name of the element. For example used by the server to identify the fields in form submits.',
      type: 'string',
    },
    {
      name: 'value',
      desc: 'Defines a default value which will be displayed in the element on page load.',
      type: 'string',
    },
  ],
  details: [
    {
      name: 'open',
      desc: 'Indicates whether the contents are currently visible (in the case of a <details> element) or whether the dialog is active and can be interacted with (in the case of a <dialog> element).',
      type: 'string',
    },
  ],
  dialog: [
    {
      name: 'open',
      desc: 'Indicates whether the contents are currently visible (in the case of a <details> element) or whether the dialog is active and can be interacted with (in the case of a <dialog> element).',
      type: 'string',
    },
  ],
  ol: [
    {
      name: 'reversed',
      desc: 'Indicates whether the list should be displayed in a descending order instead of an ascending order.',
      type: 'string',
    },
    {
      name: 'start',
      desc: 'Defines the first number if other than 1.',
      type: 'string',
    },
    {
      name: 'type',
      desc: 'Defines the type of the element.',
      type: 'string',
    },
  ],
  menu: [
    {
      name: 'type',
      desc: 'Defines the type of the element.',
      type: 'string',
    },
  ],
  data: [
    {
      name: 'value',
      desc: 'Defines a default value which will be displayed in the element on page load.',
      type: 'string',
    },
  ],
  li: [
    {
      name: 'value',
      desc: 'Defines a default value which will be displayed in the element on page load.',
      type: 'string',
    },
  ],
};
