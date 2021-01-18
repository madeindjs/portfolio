---
layout: post
title: Create a gem to zip Rails ActiveStorages
date: 2018-12-03 13:30:00 +0200
tags: rails activestorage zip
categories: tutorial
thumbnail: /img/blog/rails_zip.svg
comments: true
---

Recently for my [iSignif.fr](https://isignif.fr) project I wanted to implement a feature that allows me to **download an archive** `.zip` of several files. Nothing very complicated except that I use [**ActiveStorage**][active_storage_guide]. Active Storage is part of new features of Rails 5.2 (released in January 2018) which allows you to **attach** a file to a template using **various storage services** such as [Amazon S3](https://aws.amazon.com/fr/s3/), [Google Cloud Storage](https://cloud.google.com/storage/) or [Microsoft Azure Storage](https://azure.microsoft.com/en-us/services/storage/).

This has many advantages because files are **separated** from the web server. They are stored on services that are **specialized** in file storage. The problem is when you want to manipulate them because they are not physically present on the web server.

Since documentation is quite poor on this (because it's a recent feature), I decided to write an article.

In this article we go:

- write tests that correspond to the expected functioning
- implement the code to pass the tests
- factor and improve implementation
- export everything to a library

**TLDR**: After the complexity of implementing the code, it is very easy to move the code into reusable methods using the[`ActiveSupport::Concern`][concerns_api].

{% include promote-apionrails-en.html %}

## Table of content

- TOC
  {:toc}

## Creating an example

### Generating project

For this tutorial I have chosen to start from a new project. So let's create a new Rails project:

```bash
$ rails new zip_example --skip-action-cable --skip-coffee --skip-turbolinks --skip-system-test --skip-action-mailer
```

> I added "some" _flags_ `--skip` to remove anything that will be useless to us

We will also generate a `User` entity with the `scaffold` command:

```bash
$ rails g scaffold user name:string
```

> `scaffold` command will create the _controller_, the _model_, _views_ and even the migration

Now since I want to use _Active Storage_ wich I need to install. It's very easy to do this, the next command does it for us:

```bash
$ rails active_storage:install
```

> This command just generates a migration that will create the tables `active_storage_blobs` & `active_storage_attachments`

Now that all our **migrations** are created, just run them:

```bash
$ rake db:migrate
```

That's it, we're ready to code!

### Adding Active Storage

To attach file(s) to a template, simply add **a single line** to our `User` template. This is the beauty of _conventions over configuration_!

```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_many_attached :pictures
end
```

> Each `ActFile` has a file (`has_one_attached :file`) which therefore represents a link to an object [`ActiveStorage::Attached::Many`][active_storage_attached_many].

I will also add a field `file_field :pictures` to the **form** so that we can upload our files

```erb
<!-- app/views/users/_form.html.erb -->
<%= form_with(model: user, local: true) do |form| %>
  <!-- ... -->
  <%= form.label :name %>
  <%= form.text_field :name %>
  <%= form.file_field :pictures, multiple: true, class: 'form-control' %>
  <%= form.submit %>
<% end %>
```

Don't forget to **authorize** this field in the _controller_:

```ruby
# app/controllers/users_controller.rb
class UsersController < ApplicationController
  # ....

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_user
    @user = User.find(params[:id])
  end
end
```

We now start the server with `rails server` and go to the URL `http://localhost:3000/users/new` to create a user:

![Formulaire de création d'un utilisateur avec les fichiers](/img/blog/active_storage_create_user.png)

You should see in the server console that the files are **loaded** when you validate the form with files

```
Started POST "/users" for 127.0.0.1 at 2018-11-30 08:48:29 +0100
Processing by UsersController#create as HTML
  ActiveStorage::Blob Create (1.0ms)  INSERT INTO "active_storage_blobs" ("key", "filename", "content_type", "metadata", "byte_size", "checksum", "created_at") VALUES (?, ?, ?, ?, ?, ?, ?)  [["key", "2gVacD6hhv6viMW2bgYGVzsV"], ["filename", "2172652.png"], ["content_type", "image/png"], ["metadata", "{\"identified\":true}"], ["byte_size", 414730], ["checksum", "L2ka9VIXeONlrtvE8w0kMQ=="], ["created_at", "2018-11-30 07:48:29.724333"]]
  ActiveStorage::Blob Create (0.4ms)  INSERT INTO "active_storage_blobs" ("key", "filename", "content_type", "metadata", "byte_size", "checksum", "created_at") VALUES (?, ?, ?, ?, ?, ?, ?)  [["key", "z1JQEeVUx9Nbe7cndx5ZN1dh"], ["filename", "b64ae90.jpg"], ["content_type", "image/jpeg"], ["metadata", "{\"identified\":true}"], ["byte_size", 403558], ["checksum", "rBfrYgoJn0T5ZMsy4e9vSg=="], ["created_at", "2018-11-30 07:48:29.756230"]]
  ActiveStorage::Attachment Create (0.4ms)  INSERT INTO "active_storage_attachments" ("name", "record_type", "record_id", "blob_id", "created_at") VALUES (?, ?, ?, ?, ?)  [["name", "pictures"], ["record_type", "User"], ["record_id", 2], ["blob_id", 3], ["created_at", "2018-11-30 07:48:29.774326"]]
  ActiveStorage::Attachment Create (0.2ms)  INSERT INTO "active_storage_attachments" ("name", "record_type", "record_id", "blob_id", "created_at") VALUES (?, ?, ?, ?, ?)  [["name", "pictures"], ["record_type", "User"], ["record_id", 2], ["blob_id", 4], ["created_at", "2018-11-30 07:48:29.777281"]]
Completed 302 Found in 96ms (ActiveRecord: 37.5ms)
```

## Create ZIP

The idea would therefore be to create a route `http://localhost:3000/users/1.zip` who allow us to obtain an archive containing all the files related to the user.

### Creating test

As always we try to create a test that **fails** at first ([_Test Driven Development_][tdd]). I simply chose to create a _test controller_ and **test the answer** of the request. It's very simple, but it works:

```ruby
# test/controllers/users_controller_test.rb
# ...
class UsersControllerTest < ActionDispatch::IntegrationTest
  # ...
  test 'should get user as zip' do
    get user_url(@user, format: :zip)
    assert_response :success
    assert_equal 'application/zip', response.content_type
  end
end
```

Test fails for the moment and **it is normal**:

```
$ rake test

# Running:

.......E

Error:
UsersControllerTest#test_should_get_user_as_zip:
ActionController::UnknownFormat: UsersController#show is missing a template for this request format and variant.

request.formats: ["application/zip"]
```

### Implementation

First it's necessary to **download** the files to the server. For that we will:

1. **Create** a temporary folder
2. **Download** files content with [`ActiveStorage::Blob#download`][active_storage_blob_download] method
3. **Zip** files in the temporary folder with the content I just recovered
4. Return the contents of the zip file

Since we're talking about zip, we're going to use gem [rubyzip][rubyzip][rubyzip]. So we modify the _Gemfile_:

```ruby
# Gemfile
gem 'rubyzip', '>= 1.0.0'
```

Now run `bundle install` and start the server with `rails s`. We are ready to code!

As I said earlier the problem is you have to **get** files from the server. We could have chosen to put the content of the file in RAM but we do not know the size of the files so I prefer to store them temporarily on the hard disk.

```ruby
# app/controllers/users_controller.rb

# Download active storage files on server in a temporary folder
# @param files [ActiveStorage::Attached::Many] files to save
# @return [Array<String>] files paths of saved files
def save_files_on_server(files)
  # get a temporary folder and create it
  temp_folder = File.join(Dir.tmpdir, 'user')
  FileUtils.mkdir_p(temp_folder) unless Dir.exist?(temp_folder)

  # download all ActiveStorage into
  files.map do |picture|
    filename = picture.filename.to_s
    filepath = File.join temp_folder, filename
    File.open(filepath, 'wb') { |f| f.write(picture.download) }
    filepath
  end
end
```

Now that files are on the hard disk, we can create the zip:

```ruby
# Create a temporary zip file & return the content as bytes
#
# @param filepaths [Array<String>] files paths
# @return [String] as content of zip
def create_temporary_zip_file(filepaths)
  require 'zip'
  temp_file = Tempfile.new('user.zip')

  begin
    # Initialize the temp file as a zip file
    Zip::OutputStream.open(temp_file) { |zos| }

    # open the zip
    Zip::File.open(temp_file.path, Zip::File::CREATE) do |zip|
      filepaths.each do |filepath|
        filename = File.basename filepath
        # add file into the zip
        zip.add filename, filepath
      end
    end

    return File.read(temp_file.path)
  ensure
    # close all ressources & remove temporary files
    temp_file.close
    temp_file.unlink
    filepaths.each { |filepath| FileUtils.rm(filepath) }
  end
end
```

Then just send files content with the method [`send_data`][send_data] and send the content of the zip. We use [`respond_to`][respond_to] method to send the archive when the requested format is a zip.

```ruby
# app/controllers/users_controller.rb
class UsersController < ApplicationController
  # ...

  # GET /users/1
  # GET /users/1.json
  def show
    respond_to do |format|
      format.html { render }
      format.zip do
        files = save_files_on_server @user.pictures
        zip_data = create_temporary_zip_file files

        send_data(zip_data, type: 'application/zip', filename: 'user.zip')
      end
    end
  end

end
```

> You can see all [file here](https://github.com/madeindjs/zip_example/blob/a0fab8ec8d85bf839948c84a11badaa61b766268/app/controllers/users_controller.rb).

Tests now pass:

```
$ rake test
Run options: --seed 43367

# Running:

........

Finished in 0.220150s, 36.3389 runs/s, 49.9660 assertions/s.
8 runs, 11 assertions, 0 failures, 0 errors, 0 skips
```

### Invoicing

We may need to use this code for other models. In order to **factorize** this, Rails offers us an excellent tool: the[`ActiveSupport::Concern`][concerns_api]!

To do this, simply create a module in the _app/controllers/concerns_ folder and inherit it from [`ActiveSupport::Concern`][concerns_api]. Then, I **move** all methods we have created so far. And to use our _concerns_, I create a `send_zip` method (I will use it in the _controller_).

```ruby
# app/controllers/concerns/generate_zip.rb
module GenerateZip
  extend ActiveSupport::Concern

  protected

  # Zip all given files into a zip and send it with `send_data`
  #
  # @param active_storages [ActiveStorage::Attached::Many] files to save
  # @param filename [ActiveStorage::Attached::Many] files to save
  def send_zip(active_storages, filename: 'my.zip')
    files = save_files_on_server active_storages
    zip_data = create_temporary_zip_file files

    send_data(zip_data, type: 'application/zip', filename: filename)
  end

  private

  # Download active storage files on server in a temporary folder
  #
  # @param files [ActiveStorage::Attached::Many] files to save
  # @return [Array<String>] files paths of saved files
  def save_files_on_server(files)
    # get a temporary folder and create it
    temp_folder = File.join(Dir.tmpdir, 'user')
    FileUtils.mkdir_p(temp_folder) unless Dir.exist?(temp_folder)

    # download all ActiveStorage into
    files.map do |picture|
      filename = picture.filename.to_s
      filepath = File.join temp_folder, filename
      File.open(filepath, 'wb') { |f| f.write(picture.download) }
      filepath
    end
  end

  # Create a temporary zip file & return the content as bytes
  #
  # @param filepaths [Array<String>] files paths
  # @return [String] as content of zip
  def create_temporary_zip_file(filepaths)
    require 'zip'
    temp_file = Tempfile.new('user.zip')

    begin
      # Initialize the temp file as a zip file
      Zip::OutputStream.open(temp_file) { |zos| }

      # open the zip
      Zip::File.open(temp_file.path, Zip::File::CREATE) do |zip|
        filepaths.each do |filepath|
          filename = File.basename filepath
          # add file into the zip
          zip.add filename, filepath
        end
      end

      return File.read(temp_file.path)
    ensure
      # close all ressources & remove temporary files
      temp_file.close
      temp_file.unlink
      filepaths.each { |filepath| FileUtils.rm(filepath) }
    end
  end
end
```

In the _controller_, I simply include our _concerns_ and use the `send_zip` method.

```ruby
# app/controllers/users_controller.rb
class UsersController < ApplicationController
  include GenerateZip
  # ...

  # GET /users/1
  # GET /users/1.json
  def show
    respond_to do |format|
      format.html { render }
      format.zip { send_zip @user.pictures }
    end
  end

end
```

There you go. It's still nicer, isn't it? You can find the code [here](https://github.com/madeindjs/zip_example/commit/67a8bcb8fd6124fdb7a2c8c3f2fd85fcbd704e5b).

## Make a brand new library

That's very good but I feel a little disappointed... If we want to use this module on another project we would be tempted to **copy/paste** the module from project to project... and **it's wrong**.

Don't do that, we can go further! We can **move** our code into a **library** that will allow us to **reuse** our _concerns_ in an infinite number of other projects!

#### Make a new gem

This is easy to do. Let's leave our project for two seconds and **create** a gem with [bundler][bundler]:

```bash
$ bundle gem activestorage-zip
$ cd activestorage-zip
```

We must specify **dependencies** of our gem. Of course, we need Rails 5.2 and [rubyzip][rubyzip]:

```bash
$ bundle add rails
$ bundle add rubyzip
```

And then I move all the concerned into the file

```ruby
# lib/active_storage/send_zip.rb
require 'active_storage/send_zip/version'
require 'rails'
require 'zip'

module ActiveStorage
  module SendZip
    extend ActiveSupport::Concern

    protected
    # ...
  end
end
```

> You can see [the complete file](https://github.com/madeindjs/active_storage-send_zip/blob/master/lib/active_storage/send_zip.rb)

There you go! That's all! It was really simple!

### Use our gem

Now we will try to **use** our gem on our previous project (before publishing it on [Rubygem](https://guides.rubygems.org/) for example). So I install the gem locally with this command:

```ruby
$ rake install:local
```

Now go back to _example_zip_ project. Just add our gem to the _Gemfile_:

```ruby
# Gemfile
gem 'active_storage-send_zip', '~> 0.1.0'
```

> Don't forget to run `bundle install`

and now use it in our _controller_:

```ruby
# app/controllers/users_controller.rb
class UsersController < ApplicationController
  include ActiveStorage::SendZip
  # ...

  # GET /users/1
  # GET /users/1.zip
  def show
    respond_to do |format|
      format.html { render }
      format.zip { send_zip @user.pictures }
    end
  end
```

And to make sure everything works. Run our tests again:

```
$ rake test
Run options: --seed 4817

# Running:

........

Finished in 0.250440s, 31.9437 runs/s, 43.9226 assertions/s.
8 runs, 11 assertions, 0 failures, 0 errors, 0 skips
```

Beautiful! We can now [publish our gem on rubygems.org](https://guides.rubygems.org/publishing/).

## Conclusion

We have therefore seen that after the complexity of creating the zip the use of _concerns_ becomes very simple. In addition, by creating my own gem (which is really easy) I was able to avoid code **duplication** between several projects. I also contributed to the Rails community (at my low level :) ).

But I touched on the subject. It would also have been nice to test our gem individually in order to have a better coverage. We could also have proposed a method to create the zip directly in RAM.

But don't worry, the code is available on Github:

- the Rails application: <https://github.com/madeindjs/zip_example>
- the gem: <https://github.com/madeindjs/active_storage-send_zip>

Feel free to _fork_ or give me feedback on possible improvements.

## Liens

- <https://www.grafikart.fr/tutoriels/active-storage-1008>
- <https://stackoverflow.com/questions/50529659/download-an-active-storage-attachment-to-disc>
- <https://thinkingeek.com/2013/11/15/create-temporary-zip-file-send-response-rails/>
- <https://www.sitepoint.com/accept-and-send-zip-archives-with-rails-and-rubyzip/>
- <https://www.synbioz.com/blog/Rails_4_utilisation_des_concerns>

[active_storage_guide]: https://edgeguides.rubyonrails.org/active_storage_overview.html
[active_storage_api]: https://edgeapi.rubyonrails.org/classes/ActiveStorage.html
[active_storage_blob_download]: https://edgeapi.rubyonrails.org/classes/ActiveStorage/Blob.html#method-i-download
[active_storage_attached_many]: https://edgeapi.rubyonrails.org/classes/ActiveStorage/Attached/Many.html
[rubyzip]: https://github.com/rubyzip/rubyzip
[tdd]: https://fr.wikipedia.org/wiki/Test_driven_development
[send_data]: https://api.rubyonrails.org/classes/ActionController/DataStreaming.html#method-i-send_data
[respond_to]: https://api.rubyonrails.org/classes/ActionController/MimeResponds.html#method-i-respond_to
[concerns_api]: https://api.rubyonrails.org/classes/ActiveSupport/Concern.html
[bundler]: https://bundler.io/
