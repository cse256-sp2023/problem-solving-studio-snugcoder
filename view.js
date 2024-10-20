// ---- Define your dialogs  and panels here ----
let define_new_e_permissions = define_new_effective_permissions('effective_permissions', add_info_col=true, which_permissions=null)
let define_new_user_select = define_new_user_select_field('user_select', 'new_user', function(selected_user) {
    $('#effective_permissions').attr('username', selected_user)
 })
$('#sidepanel').append(define_new_e_permissions)
$('#sidepanel').prepend(define_new_user_select)
$('#effective_permissions').attr('filepath', '/C/presentation_documents/important_file.txt')
$('#effective_permissions').attr('username', 'administrator')

dialog = $('perm_info')
let define_dialog = define_new_dialog('dialog', 'new_dialog', options={autoOpen:false})
$('.perm_info').click(function(){
    console.log('clicked!')
    $(define_dialog).dialog('open')
    let filepath = $('#effective_permissions').attr('filepath')
    let username = $('#effective_permissions').attr('username')
    let permissionName = $(this).attr('permission_name')

    console.log('Filepath: ', filepath)
    console.log('Username: ', username)
    console.log('Permission Name: ', permissionName)

    let file_object = path_to_file[filepath]
    let user_object = all_users[username]

    $(define_dialog).empty()
    
    let explanation = get_explanation_text(allow_user_action(file_object, user_object, permissionName, explain_why = true))
    $(define_dialog).append(explanation)
    
})

    //     $('.perm_info').click(function () {
    
    // console.log('clicked!')
    // myDialog.dialog('open')
    // // Get the filepath, username, and permission name from the clicked element
    // let filepath = $('#effectivePermissions').attr('filepath')
    // let username = $('#effectivePermissions').attr('username')
    // let permissionName = $(this).attr("permission_name");
    
    
    // // Get the file and user objects
    // let file_object = path_to_file[filepath]
    // let user_object = all_users[username]
    
    // myDialog.empty()
    
    // let explanation = get_explanation_text(allow_user_action(file_object, user_object, permissionName, explain_why = true))
    // myDialog.append(explanation)
    // })
// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 