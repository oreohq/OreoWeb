<table>
    <thead>
        <tr>
            <th width="200">Video</th>
            <th>Description</th>
            <th width="300">Example</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code inline={true}>{video.id}</code></td>
            <td>ID of the Video</td>
            <td>cIdG9v82Aps</td>
        </tr>
        <tr>
            <td><code inline={true}>{video.title}</code></td>
            <td>Title of the Video</td>
            <td>Oreo HQ: Making Oreos at Factory</td>
        </tr>
        <tr>
            <td><code inline={true}>{video.link}</code></td>
            <td>Url of the Video</td>
            <td>https://youtube.com/watch?v=cIdG9v82Aps</td>
        </tr>
        <tr>
            <td><code inline={true}>{video.type}</code></td>
            <td>Type of the Video</td>
            <td>live</td>
        </tr>
        <tr>
            <td><code inline={true}>{video.description}</code></td>
            <td>Description of the Video</td>
            <td>Live from the Oreo Making Factory</td>
        </tr>
        <tr>
            <td><code inline={true}>{video.uploadedAgo}</code></td>
            <td>Time since the Video Upload</td>
            <td><t:1738117800:R></td>
        </tr>
        <tr>
            <td><code inline={true}>{video.uploadedAt}</code></td>
            <td>Date & Time of the Video Upload</td>
            <td><t:1738117800:f></td>
        </tr>
    </tbody>
</table>


<table>
    <thead>
        <tr>
            <th width="200">Channel</th>
            <th>Description</th>
            <th width="300">Example</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code inline={true}>{channel.name}</code></td>
            <td>Name of the Channel</td>
            <td>Oreo HQ</td>
        </tr>
        <tr>
            <td><code inline={true}>{channel.handle}</code></td>
            <td>Handle of the Channel</td>
            <td>@oreobot</td>
        </tr>
        <tr>
            <td><code inline={true}>{channel.avatar}</code></td>
            <td>Avatar of the Channel</td>
            <td>https://.../...</td>
        </tr>
    </tbody>
</table>


<table>
    <thead>
        <tr>
            <th width="200">Role</th>
            <th>Description</th>
            <th width="300">Example</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code inline={true}>{role.here}</code></td>
            <td>Mentions the @here role</td>
            <td><@&here></td>
        </tr>
        <tr>
            <td><code inline={true}>{role.everyone}</code></td>
            <td>Mentions the @everyone role</td>
            <td><@&everyone></td>
        </tr>
        <tr>
            <td><code inline={true}>{role.pingrole}</code></td>
            <td>Mentions the Pingrole Set</td>
            <td><@&Youtube_Alerts></td>
        </tr>
    </tbody>
</table>

<br />

1. From the slash commands menu use the **/settings** command.
2. Select the notifier type & from the dropdown click on the **User** to update content.
3. From the buttons present click on the **Change Message** button.
![placeholders1](/guide-assets/placeholders1.png?fullwidth=true)

4. Update the values in the popup and click on the **Submit** button. 
![placeholders2](/guide-assets/placeholders2.png?fullwidth=true)