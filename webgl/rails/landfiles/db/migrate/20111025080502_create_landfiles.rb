class CreateLandfiles < ActiveRecord::Migration
  def change
    create_table :landfiles do |t|
      t.string :name
      t.string :postby
      t.string :attachment

      t.timestamps
    end
  end
end
