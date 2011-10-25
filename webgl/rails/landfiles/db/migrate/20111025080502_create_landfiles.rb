class CreateLandfiles < ActiveRecord::Migration
  def change
    create_table :landfiles do |t|
      t.string :name
      t.string :postby

      t.timestamps
    end
  end
end
