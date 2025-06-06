/**
 * Emulate FormData for some browsers
 * MIT License
 * (c) 2010 François de Metz
 */
!function(n){function t(){this.fake=!0,this.boundary="--------FormData"+Math.random(),this._fields=[]}n.FormData||(t.prototype.append=function(n,t){this._fields.push([n,t])},t.prototype.toString=function(){var n=this.boundary,t="";return this._fields.forEach((function(o){if(t+="--"+n+"\r\n",o[1].name){var a=o[1];t+='Content-Disposition: form-data; name="'+o[0]+'"; filename="'+a.name+'"\r\n',t+="Content-Type: "+a.type+"\r\n\r\n",t+=a.getAsBinary()+"\r\n"}else t+='Content-Disposition: form-data; name="'+o[0]+'";\r\n\r\n',t+=o[1]+"\r\n"})),t+="--"+n+"--"},n.FormData=t)}(window);