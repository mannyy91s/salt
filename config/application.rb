require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Salt
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # config/application.rb
    config.active_record.schema_format = :sql
    config.action_mailer.default_url_options = { host: 'https://grainofsalt.herokuapp.com' }
  end
end
